import { Routes, Route } from "react-router-dom"
import { MainLayout } from "./layout/MainLayout"
import { SignInPage } from "./pages/SignInPage"
import { SignUpPage } from "./pages/SignUpPage"
import { ApplicationsListPage } from "./pages/ApplicationsListPage"
// import { CreateApplicationPage } from "./pages/CreateApplicationPage"
// import { ApplicationDetailsPage } from "./pages/ApplicationDetailsPage"

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="applications" element={<ApplicationsListPage />} />
        {/* <Route path="applications/create" element={<CreateApplicationPage />} />
        <Route path="applications/:id" element={<ApplicationDetailsPage />} /> */}
      </Route>
    </Routes>
  )
}
