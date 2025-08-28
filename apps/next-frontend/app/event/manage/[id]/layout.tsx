export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <div>
      <div>{children}</div>
    </div>
  );
}
