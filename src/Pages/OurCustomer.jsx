import React, { useEffect, useState } from 'react'
import '../Style/branchmaster.css'
import axios from 'axios'
import { Pagination } from 'react-bootstrap';
import { IoIosClose } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2'
import { Modal } from 'react-bootstrap';

function OurCustomer() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL

  console.log(apiUrl);

  const [getdata, setgetdata] = useState([])
 /// product id for product name select


  const [tabledata, settabledata] = useState([])

  const [updateid, setupdateid] = useState("")

  const [CustomerData, setCustomerData] = useState({
    customername: "",
    phoneno: "",
    Address: ""
  })
  const [UpdateCustomerData, setUpdateCustomerData] = useState({
    customername: "",
    phoneno: "",
    Address: ""
  })
  const [loader, setloader] = useState(false)
  const [validation, setvalidation] = useState([])
  const [useridforcratedby, setuseridforcratedby] = useState({})

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    if (storedUserData && storedUserData.userid) {
      setuseridforcratedby(storedUserData)
    }
    else {
      setuseridforcratedby({ message: "empty" })
    }

    axios.get(`${apiUrl}/drop-down-product_master`)       /// product dropdown
      .then((res) => {
        console.log(res.data)
        setgetdata(res.data || []);
      })
      .catch((err) => console.log(err))
    branchtabledata()
  }, [])




  const createdBy = useridforcratedby.userid || useridforcratedby.message;

  const branchtabledata = async () => {
    await axios.get(`${apiUrl}/getcustomer_data`)
      .then((res) => {
        console.log(res.data)
        settabledata(res.data || [])
        setvalidation(res.data || [])
      })
      .catch((err) => console.log(err))
  }

  const handlesubmit = (e) => {
    e.preventDefault();

    if (CustomerData.customername === '') {
      Swal.fire({
        text: "Please enter a Customer Name!",
        icon: "warning"
      });
      return;
    }

    if (CustomerData.phoneno === '') {
      Swal.fire({
        text: "Please enter a Phone Number!",
        icon: "warning"
      });
      return;
    }

    if (CustomerData.phoneno.length < 10) {
      Swal.fire({
        text: "Please enter a Valid Phone Number 10 digit!",
        icon: "warning"
      });
      return;
    }

    if (CustomerData.Address === '') {
      Swal.fire({
        text: "Please enter a Valid Address!",
        icon: "warning"
      });
      return;
    }

    // Client-side validation

    const isValidationSuccess = validation.some((item) => {
      return (
        item.CustomerName === CustomerData.customername && item.status === "Active"
      );
    });
    if (isValidationSuccess) {
      Swal.fire({
        text: "This Customer Name Is Alread Exits!",
        icon: "warning"
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure Save The Data? ',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      position: "center",
      allowOutsideClick: false,
      width: '30em',
      heightAuto: true,
      customClass: {
        title: 'my-title-className',
        actions: 'logout-action',
        confirmButton: 'order-5',
        denyButton: 'order-6',
      },
    }).then((result) => {
      setloader(true);
      if (result.isConfirmed) {

        setTimeout(() => {
          try {
            const alldata = { ...CustomerData, customername: CustomerData.customername.trim(), Address: CustomerData.Address,createdBy: createdBy }
            axios.post(`${apiUrl}/Customer_post`, alldata)
              .then((res) => {
                console.log(res)
                setloader(false);
                setCustomerData({ ...CustomerData, customername: "", Address: "", phoneno: ""});
                const functionThatReturnPromise = () =>
                  new Promise((resolve) => setTimeout(resolve, 500));
                toast.promise(
                  functionThatReturnPromise,
                  {
                    pending: 'Inserting Your Data',
                    error: 'Login failed',
                    success: "Your data Save Successfully"
                  }
                )
              })
              .then(() => {
                branchtabledata();
              })

              .catch((err) => console.log(err))
          }
          catch (err) {
            console.log(err);
            setloader(false)
          }
        }, 1500);
      }
      else {
        setloader(false)
      }

    })
  }



  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // active status table 
  const activeData = tabledata.filter((data) => data.status === 'Active');
  const InactiveData = tabledata.filter((data) => data.status === 'InActive');
  const currentActiveData = activeData.slice(indexOfFirstItem, indexOfLastItem);


  const handledelete = (productid) => {
    Swal.fire({
      title: 'Are you sure Delete Data ! ',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      position: "center",
      allowOutsideClick: false,
      width: '30em',
      heightAuto: true,
      customClass: {
        title: 'my-title-className',
        actions: 'logout-action',
        confirmButton: 'order-5',
        denyButton: 'order-6',
      },
    }).then((result) => {
      setloader(true);
      if (result.isConfirmed) {
        setTimeout(() => {
          try {
            axios.delete(`${apiUrl}/delete_customers`, { data: { id: productid } })
              .then((res) => {
                console.log(res)
                setloader(false);
                const functionThatReturnPromise = () =>
                  new Promise((resolve) => setTimeout(resolve, 500));
                toast.promise(
                  functionThatReturnPromise,
                  {
                    pending: 'Deleting Your Data',
                    error: 'Data deletion failed',
                    success: 'Data deleted successfully',
                  }
                )
              })
              .then(() => {
                branchtabledata();
              })
              .catch((err) => console.log(err));
          }
          catch (err) {
            console.log(err);
          }


        }, 1500);

      } else {
        setloader(false)
      }


    })
  }

  const searchedit = (id) => {
    axios.get(`${apiUrl}/editCustomer_data/` + id)
      .then(res => {
        const {CustomerName,Address,phoneno} = res.data[0];
        setUpdateCustomerData({ customername: CustomerName, Address: Address, phoneno: phoneno });
      })
  }

  const [show, popup] = useState(false)

  const handelupdateid = (id) => {
    setupdateid(id)
    searchedit(id);
    popup(true)
  }

  const modalClose = () => popup(false)

  const handelupdate = (e) => {
    e.preventDefault();
    if (UpdateCustomerData.customername === '') {
      Swal.fire({
        text: "Please enter a Customer Name!",
        icon: "warning"
      });
      return;
    }

    if (UpdateCustomerData.phoneno === '') {
      Swal.fire({
        text: "Please enter a Phone Number!",
        icon: "warning"
      });
      return;
    }


    if (UpdateCustomerData.Address === '') {
      Swal.fire({
        text: "Please enter a Valid Address!",
        icon: "warning"
      });
      return;
    }
    Swal.fire({
      title: 'Are you sure Update The Data? ',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      position: "center",
      allowOutsideClick: false,
      width: '30em',
      heightAuto: true,
      customClass: {
        title: 'my-title-className',
        actions: 'logout-action',
        confirmButton: 'order-5',
        denyButton: 'order-6',
      },
    }).then((result) => {
      setloader(true);
      if (result.isConfirmed) {
        setTimeout(() => {
          try {
            const alldata = { ...UpdateCustomerData, customername: UpdateCustomerData.customername.trim(), Address: UpdateCustomerData.Address.trim(), createdBy: createdBy }
            axios.put(`${apiUrl}/updatecustomerdata/${updateid}`, alldata)
              .then((res) => {
                console.log(res)
                setloader(false);
                const functionThatReturnPromise = () =>
                  new Promise((resolve) => setTimeout(resolve, 500));
                toast.promise(
                  functionThatReturnPromise,
                  {
                    pending: 'Updating Your Data',
                    error: 'Login failed',
                    success: "Your data Updated Successfully"
                  }
                )
              })
              .then(() => {
                branchtabledata();
                popup(false)
              })
              .catch((err) => console.log(err))
          }
          catch (err) {
            console.log(err);
            setloader(false)
          }

        }, 1500)

      }
      else {
        setloader(false)
      }
    })
  }

  const handleKeyDown = (e) => {
    if (
      !/^\d$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab'
    ) {
      e.preventDefault();
    }

    if (e.key === 'Tab') {
      const nextInput = e.target.parentElement.nextElementSibling.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <>
      <div>
        <div className="branchmaster-head">
          <div className="branch-form d-flex align-items-center justify-content-center p-5 position-relative ">
            <div className="spiner-loader position-absolute">
              <div className="mesh-loader" style={{ display: loader ? "flex" : "none", zIndex: "1" }}>
                <div className="set-one">
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
                <div className="set-two">
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
              </div>
            </div>
            <form action="" className='forms border rounded p-2 col-20 col-lg-8 col-xl-5 d-flex justify-content-center row' onSubmit={handlesubmit} style={{ opacity: loader ? "0.1" : "1" }} >
              <h3 className=' text-3xl text-center mt-2'>Our Customer Registration</h3>
              <hr className='mb-3 mt-2' />

              <div className="company-id col-12 ">
                <label htmlFor="branch-name" className='form-label'>Customer Name</label>
                <input type="text" className='form-control mb-3' autoComplete="nope"
                  value={CustomerData.customername}
                  placeholder='Enter Customer Name'
                  onChange={(e) => {
                    const customername = e.target.value.toUpperCase()
                    setCustomerData({ ...CustomerData, customername: customername })
                  }} />
              </div>
              <div className="branch-name col-12 ">
                <label htmlFor="branch-name" className='form-label'>Phone Number</label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={CustomerData.phoneno}
                  placeholder='Enter Customer Phone no'
                  onChange={(e) => { setCustomerData({ ...CustomerData, phoneno: e.target.value }) }} />
              </div>



              <div className="branch-name col-12 ">
                <label htmlFor="branch-name" className='form-label'>Address</label>
                <textarea className='form-control mb-3 text-area' cols="3" rows="3" value={CustomerData.Address} autoComplete="nope"
                  placeholder='Enter Customer Address'
                  onChange={(e) => {
                    setCustomerData({ ...CustomerData, Address: e.target.value })
                  }}>
                </textarea>
              </div>


              <div className="status mt-3 mb-3 col-12 col-xl-12 d-flex justify-content-center ">
                <button className='btn btn-success col-8'>Save Data</button>
              </div>

            </form>
          </div>

          <div className="table-company-datas mt-32 mt-lg-0 mt-xl-0 mt-md-0">
            <div className="overflow-auto rounded-lg shadow hidden d-flex ">

              <table className="w-full table-hover">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="w-20 p-3 text-sm font-semibold tracking-wide text-left">Sno</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Customer Name</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Phone No</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Address</th>
                    <th className="w-20 p-3 text-sm font-semibold tracking-wide text-left">Update</th>
                    <th className="w-20 p-3 text-sm font-semibold tracking-wide text-left">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentActiveData.map((datas, index) => {
                    return <tr className="bg-white">
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                        <p className="font-bold text-blue-500 hover:underline" key={index}>{datas.Sno}</p>
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.CustomerName}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.phoneno}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.Address}
                      </td>
                      <td className="p-3 whitespace-nowrap btn-primary ">
                        <button className='btn btn-primary' onClick={() => handelupdateid(datas.Customerid)}>Update</button></td>
                      <td className="p-3 whitespace-nowrap btn-danger">
                        <button className='btn btn-danger' onClick={() => handledelete(datas.Customerid)}>Delete</button></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </div>


        </div>
        {/* Update Modal */}

        <Modal show={show} animation={true} onHide={modalClose} data-bs-theme>
          <Modal.Header>
            <h1 className="modal-title fs-5" id="staticBackdropLabel">Update Customer Data</h1>
            <button type="button" className="btn icon-link-hover " onClick={modalClose}><IoIosClose style={{ fontSize: "30px"}} className='bg-danger border rounded ' /></button>
          </Modal.Header>

          <Modal.Body>
            <form action="" className='forms row' onSubmit={handelupdate} >
            <div className="company-id col-12 ">
                <label htmlFor="branch-name" className='form-label'>Customer Name</label>
                <input type="text" className='form-control mb-3' autoComplete="nope"
                  value={UpdateCustomerData.customername}
                  placeholder='Enter Customer Name'
                  onChange={(e) => {
                    const customername = e.target.value.toUpperCase()
                    setUpdateCustomerData({ ...UpdateCustomerData, customername: customername })
                  }} />
              </div>
              <div className="branch-name col-12 ">
                <label htmlFor="branch-name" className='form-label'>Phone Number</label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={UpdateCustomerData.phoneno}
                  placeholder='Enter Customer Phone no'
                  onChange={(e) => { setUpdateCustomerData({ ...UpdateCustomerData, phoneno: e.target.value }) }} />
              </div>



              <div className="branch-name col-12 ">
                <label htmlFor="branch-name" className='form-label'>Address</label>
                <textarea className='form-control mb-3 text-area' cols="3" rows="3" value={UpdateCustomerData.Address} autoComplete="nope"
                  placeholder='Enter Customer Address'
                  onChange={(e) => {
                    setUpdateCustomerData({ ...UpdateCustomerData, Address: e.target.value })
                  }}>
                </textarea>
              </div>

              <div className="status mt-3 mb-3 col-12 col-xl-12 d-flex justify-content-center ">
                <button className='btn btn-success col-8'>Save Data</button>
              </div>

            </form>

          </Modal.Body>

        </Modal>

        {/* Pagination component */}
        <Pagination className="mt-3 justify-content-end text-black">
          {[...Array(Math.ceil(Math.max(activeData.length, InactiveData.length) / itemsPerPage))].map((_, page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => handlePageChange(page + 1)}
              className='w-10 text-center'>
              {page + 1}
            </Pagination.Item>
          ))}
        </Pagination>

        <ToastContainer />
      </div>
    </>
  )
}

export default OurCustomer