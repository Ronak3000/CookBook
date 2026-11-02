import Navbar from './Navbar';
import Footer from './Footer';
export default function PageShell({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <><Navbar/><main className="studio-page"><header className="studio-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="page-description">{description}</p></header>{children}</main><Footer/></>;
}
