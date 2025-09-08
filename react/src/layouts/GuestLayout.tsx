import { useApp } from "../hooks/useApp"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate, Outlet } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"

const GuestLayout = () => {
  const { user } = useApp();

  if (user) {
    return <Navigate to='/dashboard' />
  }
  
  return (
    <div>
        <Header />
        <ScrollToTop />
        <Outlet />
        <Footer />
    </div>
  )
}

export default GuestLayout