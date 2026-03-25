type RootLayoutProps = {
  children?: React.ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return <>{children ?? null}</>;
}
