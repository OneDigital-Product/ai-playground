## 13) What to do about “magic links”

* If you **must** use **magic links**, flip the tenant (or an environment) to **Classic Login** and set `passwordlessMethod: 'link'` in the login template. Be aware of the **same‑browser** limitation (not ideal for iOS—links may open in Safari while the flow started in Chrome). ([Auth0][2])
* If you want to **stay on Universal Login** (recommended), use **Email OTP**. You still send via **Azure Communication Services (SMTP)** configured in Auth0. ([Auth0][9])

---

