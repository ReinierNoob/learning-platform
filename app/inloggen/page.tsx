import LoginForm from "./login-form";

export default function LoginPage() {
  return <main className="auth-shell"><section><p className="kicker">Enterprise Architecture Works</p><h1>Welkom in je leeromgeving.</h1><p>Log in met het geverifieerde e-mailadres waaraan jouw cursusrecht is gekoppeld.</p><LoginForm /><p className="small">Uitgenodigd, maar nog geen account? <a href="/registreren">Account aanmaken</a></p></section></main>;
}
