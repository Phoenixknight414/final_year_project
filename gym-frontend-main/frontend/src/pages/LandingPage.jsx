import NavbarComponent from "../components/NavbarComponent.jsx";
import HeroComponent from "../components/HeroComponent.jsx";
import AICoachComponent from "../components/AICoachComponent.jsx";
import PersonalizedWorkoutsComponent from "../components/PersonalizedWorkoutsComponent.jsx";
import HowItWorksComponent from "../components/HowItWorksComponent.jsx";
import FooterComponent from "../components/FooterComponent.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavbarComponent />
      <HeroComponent />
      <AICoachComponent />
      <PersonalizedWorkoutsComponent />
      <HowItWorksComponent />
      <FooterComponent />
    </div>
  );
}
