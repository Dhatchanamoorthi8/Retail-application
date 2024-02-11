import React, { useState } from "react"
import Loginpage from "./Pages/Loginpage";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from "./Pages/Sidebar";
import Dashboard from "./Pages/Dashboard";
import BranchMaster from "./Pages/BranchMaster";
import CompanyMaster from "./Pages/CompanyMaster";
import Particlebg from "./Components/Particlebg";
import Billing from "./Pages/Billing.jsx";
import CompanyProfile from "./Pages/CompanyProfile.jsx";
import ProductName from "./Pages/ProductName.jsx";

import CustomersaleReport from "./Pages/CustomersaleReport.jsx";
import SupplierMaster from "./Pages/SupplierMaster.jsx";
import OurCustomer from "./Pages/OurCustomer.jsx";
import PurchaseReport from "./Pages/PurchaseReport.jsx";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";




function App() {



  const storedLoggedIn = localStorage.getItem('loggedIn');
  const [loggedIn, setLoggedIn] = useState(storedLoggedIn === 'true');

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('loggedIn', 'true')
  }
  const handleLogout = () => {
    setLoggedIn(false)
    localStorage.setItem('loggedIn', 'fasle')
  }

  var Debug = false;
  if(!Debug){
    console.log = function(){};
  }

  return (
    <Router>
      <>
        <Particlebg />

        <Routes>
          <Route path="/" element={
            !loggedIn ?
              (<Loginpage setLoggedIn={handleLogin} />) : (<Navigate to={'/dashboard'} />)
          }></Route>

          <Route path="/dashboard" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <Dashboard onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={"/"} />)
          }></Route>

          <Route path="/company" element={loggedIn ?
            (<Sidebar onLogout={handleLogout} >
              <CompanyMaster onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>

          <Route path="/branch" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <BranchMaster onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>


          <Route path="/product" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <ProductName onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>



          <Route path="/supplier" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <SupplierMaster onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>

          <Route path="/ourcustomer" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <OurCustomer onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>



          <Route path="/billing" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <Billing onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>


          <Route path="/purchasesalesreport" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <PurchaseReport onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>


          <Route path="/customerwisesalesreport" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <CustomersaleReport onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>



          <Route path="/company-profile" element={loggedIn ?
            (<Sidebar onLogout={handleLogout}>
              <CompanyProfile onLogout={handleLogout} />
            </Sidebar>) : (<Navigate to={'/'} />)
          }></Route>

        </Routes>
      </>
    </Router>
  );
}

export default App;
