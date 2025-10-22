import "../globals.css";
import { Providers } from "@/app/[locale]/providers";
import { AppContextProvider } from "@/contexts/app";
import { NextAuthSessionProvider } from "@/providers/session";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ClientWrapper } from "@/components/common/ClientWrapper";


export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/logo.jpeg" />
      </head>

      <body>
        <ClientWrapper>
          <AppContextProvider>
            <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
              <NextAuthSessionProvider>
                <NextIntlClientProvider messages={messages}>
                  {children}
                </NextIntlClientProvider>
              </NextAuthSessionProvider>
            </Providers>
          </AppContextProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
