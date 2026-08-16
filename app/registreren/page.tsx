import RegisterForm from "./register-form";

export default function RegisterPage() {
  return <main className="auth-shell"><section><p className="kicker">Toegangsuitnodiging</p><h1>Activeer je account.</h1><p>Gebruik exact hetzelfde e-mailadres als in je uitnodiging. Je cursusrecht wordt na verificatie automatisch gekoppeld.</p><RegisterForm /></section></main>;
}
