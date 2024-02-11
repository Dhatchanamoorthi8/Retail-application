import axios, { all } from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Form, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2'
import { useLocation } from 'react-router-dom'
const Billing = () => {

  const apiUrl = process.env.REACT_APP_API_BASE_URL



  const [billdatas, setbilldatas] = useState({
    salesquantity: 0,
    totalamount: "",
    customeramount: "",
    pendingamount: ""
  })

  const [useridforcratedby, setuseridforcratedby] = useState({})

  useEffect(() => {            /// this useeffect localstorage data get
    const storedUserData = JSON.parse(localStorage.getItem('userData'));   // local storage datas 
    if (storedUserData && storedUserData.userid) {
      setuseridforcratedby(storedUserData)
    }
    else {
      setuseridforcratedby({ message: "empty" })
    }
  }, [])
  const createdBy = useridforcratedby.userid || useridforcratedby.message;       // set createdby user


  //  supplier name get code
  const [SupplierName, SetSupplierName] = useState([])

  console.log(SupplierName, "SupplierName");

  const [supplierdatas, setsupplierdatas] = useState([])


  useEffect(() => {
    const supplierdata = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-suppliermaster`);
        setsupplierdatas(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    supplierdata(); // Fetch supplier names when component mounts
  }, []);

  //  product get show dropdown code

  const [productalldata, setproductalldata] = useState([])


  const [ProductSelection, SetProductSelection] = useState([]);


  useMemo(() => {
    const GetproductName = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-supplierdatas?SupplierName=${SupplierName[0]?.Suppliername || ''}`);
        setproductalldata(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    GetproductName();
  }, [SupplierName, apiUrl]);

  //  Selected Product Quantity get code


  const [quantities, setQuantities] = useState([]);


  useMemo(() => {
    const getQuantities = async () => {
      try {
        const promises = ProductSelection.map(async (selectedProduct) => {
          const res = await axios.get(`${apiUrl}/drop-down-supplierquantity?quantity=${selectedProduct.productid || ''}&suppliername=${SupplierName[0]?.Suppliername || ''}`);
          return { product: selectedProduct.productname, quantity: res.data[0]?.Qtykg || 0, Amount: res.data[0]?.Amount || 0 };
        });
        const updatedQuantities = await Promise.all(promises);
        setQuantities(updatedQuantities);
      } catch (err) {
        console.log(err);
      }
    };

    if (ProductSelection.length > 0) {
      getQuantities();
    }
  }, [ProductSelection, SupplierName, apiUrl]);



  //  customer name get code
  const [getCustomername, setgetCustomername] = useState([])

  const [customername, setcustomername] = useState([])

  useEffect(() => {
    const CustomerName = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-Customername`);
        setgetCustomername(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    CustomerName();
  }, [apiUrl]);


  //  Pending Amount  getting from Database
  const [pendingAmount, SetpendingAmount] = useState([]);

  console.log(pendingAmount);

  const handleCustomerSelect = async (selected) => {
    try {
      const customerid = selected[0]?.Customerid;
      if (customerid) {
        const res = await axios.get(`${apiUrl}/getPending_amount?customerid=${customerid}`);
        SetpendingAmount(res.data);
      } else {
        SetpendingAmount(0);
      }
    } catch (err) {
      console.log(err);
    }
  };





  /// total amount calculation

  // total amount and pending plus calculation 



  const hanldegetquantity = (e) => {
    const userQuantity = parseInt(e.target.value, 10);
    if (!isNaN(userQuantity)) {
      const quantityTotal = quantities.reduce((total, data) => total + data.quantity, 0);
      if (userQuantity > quantityTotal) {
        Swal.fire({
          text: "Entered quantity is greater than the total quantity. Please enter a lesser value.",
          icon: "warning"
        });
        e.target.value = "";
      } else {
        setbilldatas({ ...billdatas, salesquantity: userQuantity });
      }
    }
  };



  useMemo(() => {
    const totalamountCalculation = () => {
      const quantityTotal = quantities.map((data) => {
        return data.quantity;
      });

      const TotalAmount = quantities.map((data) => {
        return data.Amount;
      });

      let quantityValue = quantityTotal[0] || 0
      let AmountValue = TotalAmount[0] || 0

      console.log(quantityTotal.join(', '), TotalAmount.join(', '), "total values");

      const oneKgprice = AmountValue / quantityValue;
      const value = oneKgprice

      console.log(value, "kgprice");

      let totalValue = billdatas.salesquantity * value;

      const totalamount = Math.round(totalValue)

      setbilldatas({ ...billdatas, totalamount: totalamount || 0 })
    }

    totalamountCalculation()

  }, [billdatas.salesquantity, quantities, productalldata])



  const hanldeinsert = (e) => {
    e.preventDefault();
    if (customername.length === 0) {
      Swal.fire({
        text: "Please Select Customer Name!",
        icon: "warning"
      });
      return;
    }

    if (billdatas.salesquantity === 0) {
      Swal.fire({
        text: "Please enter a Quanity!",
        icon: "warning"
      });
      return;
    }

    const existingData = JSON.parse(sessionStorage.getItem('billdatas'));

    const dataArray = Array.isArray(existingData) ? existingData : [];

    //const totalAmount = parseInt(pendingAmount[0]?.pending) + parseInt(billdatas.totalamount)

    const newData = {
      Suppliername: SupplierName[0].Suppliername,
      productname: ProductSelection[0]?.productname,
      productid: ProductSelection[0]?.productid,
      quantitiy: parseInt(billdatas.salesquantity),
      totalamount: billdatas.totalamount,
      originalQuantity: parseInt(quantities[0]?.quantity),
      originalprice: parseInt(quantities[0]?.Amount),
      pending: parseInt(pendingAmount[0]?.pending),
      customername: customername[0]?.Customerid
    };

    dataArray.push(newData);

    sessionStorage.setItem('billdatas', JSON.stringify(dataArray));

    const storedUserData = JSON.parse(sessionStorage.getItem('billdatas'));
    settabledata(Array.isArray(storedUserData) ? storedUserData : []);
  }



  const [tabledata, settabledata] = useState([])




  useEffect(() => {
    const tableloaddata = () => {
      const storedUserData = JSON.parse(sessionStorage.getItem('billdatas'));
      settabledata(Array.isArray(storedUserData) ? storedUserData : []);
    }
    tableloaddata();

  }, []);


  const [loader, setloader] = useState(false)

  const handleDelete = (index) => {
    // Copy the existing tabledata
    const updatedTableData = [...tabledata];

    // Remove the row at the specified index
    updatedTableData.splice(index, 1);

    // Update the state with the modified data
    settabledata(updatedTableData);

    // Optionally, update sessionStorage or any other storage mechanism
    sessionStorage.setItem('billdatas', JSON.stringify(updatedTableData));

    totalAmountgrid()
  }



  const [OverallTotalvalue, SetOverallTotalvalue] = useState({
    totalquantity: 0,
    totalAmount: 0
  })


  const totalAmountgrid = () => {
    const overallquantitiy = tabledata.map((data) => data.quantitiy || 0);
    const overallamount = tabledata.map((data) => data.totalamount || 0);
    const sumQuantities = overallquantitiy.reduce((total, quantity) => total + quantity, 0);
    const sumAmounts = overallamount.reduce((total, amount) => total + amount, 0);
    console.log(sumQuantities, "sum of quantities");
    console.log(sumAmounts, "sum of amounts");

    SetOverallTotalvalue({
      totalquantity: sumQuantities,
      totalAmount: sumAmounts
    });
  };

  useEffect(() => {
    totalAmountgrid();
  }, [tabledata]);



  const handlesavebill = async () => {
    try {
      const totalAmount = OverallTotalvalue.totalAmount + parseInt(pendingAmount[0]?.pending);
      // Prompt user to enter total amount
      const { value: enteredAmount } = await Swal.fire({
        title: "Enter Total Amount",
        text: `(${OverallTotalvalue.totalAmount} Total + ${pendingAmount[0]?.pending} Pending)`,

        input: "tel",
        inputLabel: totalAmount,
        inputLabel: totalAmount,


        inputPlaceholder: "Enter The Amount",
        showCancelButton: true,
        inputAttributes: {
          onkeypress: "return (event.charCode >= 48 && event.charCode <= 57)",
          maxlength: "6",
        },
        customClass: {
          inputLabel: 'total-amount-label'
        },
        inputValidator: (value) => {
          if (!value) {
            return "Please Enter Amount!";
          }
          if (parseFloat(value) > totalAmount) {
            return "Please Enter Valid Amount Not Allow Greater than Total amount";
          }
          return null;
        }
      });

      if (enteredAmount) {
        Swal.fire(`Your Total Amount: ${enteredAmount}`);

        // Pending amount Calculation

        let pendingvalue = totalAmount - enteredAmount

        const storedUserData = JSON.parse(sessionStorage.getItem('billdatas'));

        // Make POST request to server to save transaction history
        const postResponse = await axios.post(`${apiUrl}/bill-transcation-post`, {
          overalldata: storedUserData,
          pendingAmount: pendingvalue,
          customerAmount: enteredAmount,
          overallamount: totalAmount
        });
        console.log("Axios success:", postResponse);
        // Clear session storage and reload the page
        sessionStorage.clear();
        window.location.reload();
        console.log("Session cleared");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  }



  //auto clear session

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/billing') {
      sessionStorage.clear()
    }
  }, [])




  return (
    <div>
      <div className="enquiry-container d-flex align-items-center justify-content-center position-relative ">
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
        <form action="" className='bg-transparent border rounded  p-3 col-20 col-lg-8 col-xl-7 row' style={{ opacity: loader ? "0.1" : "1" }} onSubmit={hanldeinsert}>
          <div className="head text-center ">
            <h1 className='text-2xl mb-1 '>Billing</h1>
            <hr className='mb-2' />
          </div>
          <Form.Group className='col-12 col-md-6 col-lg-6 col-xl-6 mb-3'>
            <Form.Label>Supplier Name</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="Suppliername"
              onChange={SetSupplierName}
              options={supplierdatas}
              placeholder="Enter Supplier Name"
              selected={SupplierName}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Select The Product</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="productname"
              options={productalldata}
              onChange={(selected) => {
                SetProductSelection(selected)
              }}
              placeholder="Choose Your Product"
              selected={ProductSelection}
            />
          </Form.Group>

          <div className={`quantity-of-product col-12 col-md-6 col-lg-6 col-xl-6 mb-2`} >
            <Form.Label className='col flex-wrap'><span className='text-1xl fw-bold '> {quantities[0]?.product} </span>Quantity & Price
              <InputGroup className="mb-3 mt-2" >
                <Form.Control
                  aria-label="Quantity"
                  aria-describedby="basic-addon1"
                  readOnly
                  value={quantities[0]?.quantity || '0000'} />
                <InputGroup.Text id="basic-addon1" className='col-7 text-end' > {quantities[0]?.Amount || '00000'} ₹‎ <span className='ms-auto'> Total Amount</span></InputGroup.Text>
              </InputGroup>
            </Form.Label>
          </div>


          <Form.Group className='col-12 col-md-6 col-lg-6 col-xl-6 mb-3'>
            <Form.Label>Customer Name</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="CustomerName"
              onChange={(selected) => {
                setcustomername(selected);
                handleCustomerSelect(selected);
              }}
              options={getCustomername}
              placeholder="Enter Customer Name"
              selected={customername}
              disabled={OverallTotalvalue.totalAmount !== 0}
            // className={`${OverallTotalvalue.totalAmount === 0 ? "" : "disabled"}`}
            />
          </Form.Group>


          <div className="total-amount col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Pending Amount</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Amount"
                aria-label="totalamount"
                aria-describedby="basic-addon1"
                value={pendingAmount[0]?.pending}
                readOnly
              />
              <InputGroup.Text id="basic-addon1">₹‎</InputGroup.Text>
            </InputGroup>
          </div>

          <div className="toal-quantity col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label >Sales Quantity</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Sales Quantity"
                aria-label="Quantity"
                aria-describedby="basic-addon1"
                onChange={hanldegetquantity}
                value={billdatas.salesquantity}
              />
              <InputGroup.Text id="basic-addon1" >Kg</InputGroup.Text>
            </InputGroup>

          </div>




          <div className="total-amount col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Total Amount</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Amount"
                aria-label="totalamount"
                aria-describedby="basic-addon1"
                value={billdatas.totalamount}

                readOnly
              />
              <InputGroup.Text id="basic-addon1">₹‎</InputGroup.Text>
            </InputGroup>
          </div>




          <div className="save-btn d-flex justify-content-center ">
            <button className='btn btn-success col-6'>Save Data</button>
          </div>
        </form>
      </div>


      <div className="table-company-datas mt-32 mt-lg-0 mt-xl-5 mt-md-0">
        <div className="overflow-auto rounded-lg shadow hidden d-flex ">
          <table className="w-full table-hover">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="w-30 p-3 text-sm font-semibold tracking-wide text-left">Sno</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Product Name</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Quantity</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Amount</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tabledata.map((data, index) => {
                return <tr className="bg-white" key={index}>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                    <p className="font-bold text-blue-500 hover:underline">{index}</p>
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.productname}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.quantitiy}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.totalamount}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    <button className='btn btn-danger' onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                </tr>
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white border " >
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">

                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-start">
                  <p className='ps-4'>Total Quantity : <span className=' fw-semibold fs-5 mt-3'>{OverallTotalvalue.totalquantity}</span> </p>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-start">
                  <p className='ps-4'>Total Amount : <span className=' fw-semibold fs-5 mt-3'>{OverallTotalvalue.totalAmount}</span></p>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                  <button className={`btn btn-success  ${tabledata.length > 0 ? '' : 'disabled'} `} onClick={handlesavebill}>Save Bill</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


    </div>
  )
}

export default Billing
