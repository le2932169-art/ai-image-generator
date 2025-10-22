import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { Provider } from "next-auth/providers/index";
import { genUniSeq, getIsoTimestr } from "@/backend/utils/index";
import { saveUser } from "@/backend/service/user";
import { User } from "@/backend/type/type";
import { createCreditUsage } from "@/backend/service/credit_usage";
import { getCreditUsageByUserId } from "@/backend/service/credit_usage";

let providers: Provider[] = [];

// 添加 GitHub OAuth 提供商（在中国大陆可正常访问）
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

// 添加 Google OAuth 提供商（需要网络代理或 VPN）
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
        },
      },
    })
  );
}

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/`;
    },
    async session({ session, token, user }) {
      if (token && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user && user.email && account) {
        try {
          const dbUser: User = {
            uuid: genUniSeq(),
            email: user.email,
            nickname: user.name || "",
            avatar_url: user.image || "",
            signin_type: account.type,
            signin_provider: account.provider,
            signin_openid: account.providerAccountId,
            created_at: getIsoTimestr(),
            signin_ip: "",
          };
          
          // 如果数据库不可用，只使用基本用户信息
          try {
            await saveUser(dbUser);
            const creditUsage = await getCreditUsageByUserId(dbUser.uuid);
            if (!creditUsage) {
              await createCreditUsage({
                user_id: dbUser.uuid,
                user_subscriptions_id: -1,
                is_subscription_active: false,
                used_count: 0,
                // 赠送的积分数
                period_remain_count: 20,
                period_start: new Date(),
                period_end: new Date(
                  new Date().setMonth(new Date().getMonth() + 1)
                ),
                created_at: new Date(),
              });
            }
          } catch (dbError) {
            console.warn('Database not available during authentication, using mock user data:', dbError);
          }
          
          token.user = {
            uuid: dbUser.uuid,
            nickname: dbUser.nickname,
            email: dbUser.email,
            avatar_url: dbUser.avatar_url,
            created_at: dbUser.created_at,
          };
        } catch (error) {
          console.error('Error in JWT callback:', error);
          // 如果发生任何错误，创建一个基本的 token
          token.user = {
            uuid: genUniSeq(),
            nickname: user.name || "User",
            email: user.email || "",
            avatar_url: user.image || "",
            created_at: getIsoTimestr(),
          };
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
