import React, { useEffect, useState } from 'react'
import '../Style/branchmaster.css'
import axios from 'axios'
import { Pagination } from 'react-bootstrap';
import { IoIosClose } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2'
import { Modal } from 'react-bootstrap';


function SupplierMaster() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL

  console.log(apiUrl);

  const [getdata, setgetdata] = useState([])

  const [selectedProductId, setselectedProductId] = useState({
    productid: '',
    productname: ''
  });  /// product id for product name select


  const [tabledata, settabledata] = useState([])

  const [updateid, setupdateid] = useState("")

  const [SupplierData, setSupplierData] = useState({
    Suppliername: "",
    Address: "",
    phoneno: "",
    Qtykg: "",
    Amount: ""
  })
  const [UpdateSupplierData, setUpdateSupplierData] = useState({
    Suppliername: "",
    Address: "",
    phoneno: "",
    Qtykg: 0,
    Amount: 0,
    productid: ""
  })


  const[TotalQuantity,setTotalQuantity]=useState({
    quantity:0,
    amount:0
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
    await axios.get(`${apiUrl}/getsupplier_data`)
      .then((res) => {
        console.log(res)
        settabledata(res.data || [])
        setvalidation(res.data || [])
      })
      .catch((err) => console.log(err))
  }


  const handleproductname = (e) => {
    const value = e.target.value;
    const [productid, productname] = value.split("-");

    setselectedProductId({ ...selectedProductId, productid: productid, productname: productname });
  }

  const handlesubmit = (e) => {
    e.preventDefault();

    if (SupplierData.Suppliername === '') {
      Swal.fire({
        text: "Please enter a Supplier Name!",
        icon: "warning"
      });
      return;
    }

    if (SupplierData.phoneno === '') {
      Swal.fire({
        text: "Please enter a Phone Number!",
        icon: "warning"
      });
      return;
    }

    if (selectedProductId.productid === '') {
      Swal.fire({
        text: "Please select a Product Name!",
        icon: "warning"
      });
      return;
    }

    if (SupplierData.Qtykg === '') {
      Swal.fire({
        text: "Please enter a Quantity!",
        icon: "warning"
      });
      return;
    }

    if (SupplierData.Amount === '') {
      Swal.fire({
        text: "Please enter a Valid Amount!",
        icon: "warning"
      });
      return;
    }

    if (SupplierData.Address === '') {
      Swal.fire({
        text: "Please enter a Valid Address!",
        icon: "warning"
      });
      return;
    }
    //  Client-side validation


    const isValidationSuccess = validation.some((item) => {
      return (
        item.Suppliername === SupplierData.Suppliername && item.productname === selectedProductId.productname
      );
    });
    if (isValidationSuccess) {
      Swal.fire({
        text: "This Supplier Name And Product Name Is Alread Exits!",
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
            const alldata = { ...SupplierData, Suppliername: SupplierData.Suppliername.trim(), Address: SupplierData.Address, ProductId: selectedProductId.productid, createdBy: createdBy }
            axios.post(`${apiUrl}/supplier_post`, alldata)
              .then((res) => {
                branchtabledata();
                setloader(false);
                setSupplierData({ ...SupplierData, Suppliername: "", status: "", phoneno: "", Qtykg: "", Amount: "", Address: "" });
                setselectedProductId({ ...selectedProductId, productid: '' })
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
            axios.delete(`${apiUrl}/delete_suppliers`, { data: { id: productid } })
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
    axios.get(`${apiUrl}/editsupplier_data/` + id)
      .then(res => {
        const { Suppliername, Address, phoneno, Qtykg,Amount, productid } = res.data[0];
        setUpdateSupplierData({ Suppliername: Suppliername, Address: Address, phoneno: phoneno, Qtykg: parseInt(Qtykg), Amount: parseInt(Amount), productid: productid });
      })
  }

  const [show, popup] = useState(false)

  const handelupdateid = (id) => {
    setupdateid(id)
    searchedit(id);
    popup(true)
  }


  console.log(TotalQuantity,'TotalQuantity');

  const modalClose = () => popup(false)

  const handelupdate = (e) => {
    e.preventDefault();
    if (UpdateSupplierData.Suppliername === '') {
      Swal.fire({
        text: "Please enter a Branch Name!",
        icon: "warning"
      });
      return;
    }
    if (UpdateSupplierData.phoneno === '') {
      Swal.fire({
        text: "Please enter a Phone Number!",
        icon: "warning"
      });
      return;
    }

    if (TotalQuantity.quantity === 0) {
      Swal.fire({
        text: "Please enter a Quantity!",
        icon: "warning"
      });
      return;
    }

    if (TotalQuantity.amount === 0 ) {
      Swal.fire({
        text: "Please enter a Valid Amount!",
        icon: "warning"
      });
      return;
    }


    if (UpdateSupplierData.Address === '') {
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

           const totalquantity = parseInt(TotalQuantity.quantity) + parseInt(UpdateSupplierData.Qtykg)
           const totalamount = parseInt(TotalQuantity.amount) + parseInt(UpdateSupplierData.Amount)

            const alldata = { ...UpdateSupplierData,totalqty:totalquantity,totalamt:totalamount, Suppliername: UpdateSupplierData.Suppliername.trim(), Address: UpdateSupplierData.Address.trim(), createdBy: createdBy }
            axios.put(`${apiUrl}/updatesupplierdata/${updateid}`, alldata)
              .then((res) => {
                setTotalQuantity({...TotalQuantity, amount: 0, quantity: 0 })
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
            <form action="" className='forms border rounded  col-20 col-lg-8 col-xl-7 row ' onSubmit={handlesubmit} style={{ opacity: loader ? "0.1" : "1" }} tabIndex={true} >
              <h3 className=' text-3xl text-center'>Product Registration</h3>
              <hr className='mb-3 mt-1' />

              <div className="company-id col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Supplier Name</label>
                <input type="text" className='form-control mb-3' autoComplete="nope"
                  value={SupplierData.Suppliername}
                  placeholder='Enter Supplier Name'
                  onChange={(e) => {
                    const Suppliername = e.target.value.toUpperCase()
                    setSupplierData({ ...SupplierData, Suppliername: Suppliername })
                  }} />
              </div>
              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Phone No</label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={SupplierData.phoneno}
                  placeholder='Enter Phone Name'
                  onChange={(e) => { setSupplierData({ ...SupplierData, phoneno: e.target.value }) }} />
              </div>

              <div className="company-id col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="Branch" className='form-label'>Product Name</label>
                <select name="Branch" id="branch-select" className='form-select col-12 mb-3' onChange={handleproductname}
                  value={`${selectedProductId.productid}-${selectedProductId.productname}`} >
                  <option value="">Select Product</option>
                  {getdata && getdata.filter(data => data.status === "Active")
                    .map((data, index) => (
                      <option key={index} value={`${data.productid}-${data.productname}`}>
                        {data.productname}
                      </option>
                    ))}
                </select>
              </div>


              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Quantity</label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={SupplierData.Qtykg}
                  placeholder='Enter Purchase Quantity'
                  onChange={(e) => { setSupplierData({ ...SupplierData, Qtykg: e.target.value }) }} />
              </div>


              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Amount</label>
                <input type="text" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={SupplierData.Amount}
                  placeholder='Enter Amount'
                  onChange={(e) => { setSupplierData({ ...SupplierData, Amount: e.target.value }) }} />
              </div>

              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Address</label>
                <textarea className='form-control mb-3 text-area' cols="3" rows="3" value={SupplierData.Address} autoComplete="nope"
                  placeholder='Enter Address'
                  onChange={(e) => {
                    setSupplierData({ ...SupplierData, Address: e.target.value })
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
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Supplier Name</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Product Name</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Quantity</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Amount</th>
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
                        {datas.Suppliername}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.productname}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.Qtykg}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.Amount}
                      </td>

                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.phoneno}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" key={index}>
                        {datas.Address}
                      </td>
                      <td className="p-3 whitespace-nowrap btn-primary ">
                        <button className='btn btn-primary' onClick={() => handelupdateid(datas.Supplierid)}>Update</button></td>
                      <td className="p-3 whitespace-nowrap btn-danger">
                        <button className='btn btn-danger' onClick={() => handledelete(datas.Supplierid)}>Delete</button></td>
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
            <h1 className="modal-title fs-5" id="staticBackdropLabel">Update Supplier Data</h1>
            <button type="button" className="btn icon-link-hover " onClick={modalClose}><IoIosClose style={{ fontSize: "30px" }} /></button>
          </Modal.Header>

          <Modal.Body>
            <form action="" className='forms row ' onSubmit={handelupdate} >
              <div className="company-id col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Supplier Name</label>
                <input type="text" className='form-control mb-3' autoComplete="nope"
                  value={UpdateSupplierData.Suppliername}
                  placeholder='Enter Supplier Name'
                  onChange={(e) => {
                    const Suppliername = e.target.value.toUpperCase()
                    setUpdateSupplierData({ ...UpdateSupplierData, Suppliername: Suppliername })
                  }} />
              </div>
              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Phone No</label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  value={UpdateSupplierData.phoneno}
                  placeholder='Enter Phone Name'
                  onChange={(e) => { setUpdateSupplierData({ ...UpdateSupplierData, phoneno: e.target.value }) }} />
              </div>

              <div className="company-id col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="Branch" className='form-label'>Product Name</label>
                <select name="Branch" id="branch-select" className='form-select col-12 mb-3'
                  onChange={(e) => { setUpdateSupplierData({ ...UpdateSupplierData, productid: e.target.value }) }}
                  value={UpdateSupplierData.productid} >
                  <option value="">Select Product</option>
                  {getdata && getdata.filter(data => data.status === "Active")
                    .map((data, index) => (
                      <option key={index} value={data.productid}>
                        {data.productname}
                      </option>
                    ))}
                </select>
              </div>


              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Quantity <span className=' fw-semibold bg-dark-subtle border mt-1 p-1 rounded-3 '>{UpdateSupplierData.Qtykg} avaliable</span></label>
                <input type="tel" className='form-control mb-3' maxLength={10} onKeyDown={handleKeyDown} autoComplete="nope"
                  placeholder='Enter Purchase Quantity'
                  onChange={(e) => { setTotalQuantity({ ...TotalQuantity,quantity:e.target.value})}} />
              </div>


              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Amount <span className=' fw-semibold bg-dark-subtle border mt-1 p-1 rounded-3 '>{UpdateSupplierData.Amount} avaliable</span></label>
                <input
                  type="tel"
                  className='form-control mb-3'
                  maxLength={7}
                  onKeyDown={handleKeyDown}
                  autoComplete="nope"
                  placeholder='Enter Amount'
                  onChange={(e) => { setTotalQuantity({ ...TotalQuantity, amount:e.target.value}) }}
                />
              </div>

              <div className="branch-name col-12 col-md-6 col-lg-6 col-xl-6">
                <label htmlFor="branch-name" className='form-label'>Address</label>
                <textarea className='form-control mb-3 text-area' cols="3" rows="3" value={UpdateSupplierData.Address} autoComplete="nope"
                  placeholder='Enter Address'
                  onChange={(e) => {
                    setUpdateSupplierData({ ...UpdateSupplierData, Address: e.target.value })
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

export default SupplierMaster