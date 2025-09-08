import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'

const SurveyLayout = () => {
  return (
    <div>
        <Header />
        <ScrollToTop />
        <Outlet />
        <Footer />
    </div>
  )
}

export default SurveyLayout