export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Product Gateway</h1>
      <p>This host app is a lightweight router that proxies to child apps.</p>
      <ul style={{ lineHeight: 2 }}>
        <li>
          <a href="/app">/app</a> → Web app
        </li>
        <li>
          <a href="/admin">/admin</a> → Admin app
        </li>
        <li>
          <a href="/reporting">/reporting</a> → Reporting (AKS)
        </li>
      </ul>
      <p>
        Health check: <a href="/healthz">/healthz</a>
      </p>
    </main>
  );
}
