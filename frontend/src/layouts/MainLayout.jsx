import { Outlet, Link } from "react-router-dom";
import textureBackgrd from '../assets/backgrd.png';
import headerLogo from '../assets/header_link.png';


const backgrdStyle = {
  backgroundImage: `url(${textureBackgrd})`,
  backgroundRepeat: 'repeat',
  backgroundSize: 'auto',
  minHeight: '100vh'
};


export default function MainLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-gray-900 text-white p-6 hidden md:block" style={backgrdStyle}>
        <Link to="/"> <img src={headerLogo} alt="Logo" className="mb-6" /> </Link>
        <nav className="flex flex-col items-center gap-3">
          <Link to="/"> <b style={{color: "#09593c"}}>INICIO</b> </Link>
          <Link to="/profile"> <b style={{color: "#09593c"}}>PERFIL</b> </Link>
          <Link to="/login"> <b style={{color: "#09593c"}}>LOGIN</b> </Link>
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
