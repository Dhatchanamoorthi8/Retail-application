import axios from 'axios';
import React, { useState, useRef } from 'react';
import "../Style/report.css"
import { CSVLink } from "react-csv";
import { HiOutlineDownload, } from "react-icons/hi";
import { BsFiletypePdf } from "react-icons/bs";
import ReactToPrint from 'react-to-print';
import { Pagination } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { IoIosClose } from "react-icons/io";
import "../Style/report.css"

function CustomersaleReport() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL

  console.log(apiUrl);

  const [Tabledatas, Settabledatas] = useState([])

  const [getData, setGetdata] = useState({
    fromDate: "",
    toDate: "",
  })

  const SearchData = () => {
    console.log(getData);
    axios.get(`${apiUrl}/customerwisesalesreport`, {
      params: getData
    })
      .then((res) => {
        console.log(res.data);
        Settabledatas(res.data || [])
        const ReportRecord = res.data;
        const transformedData = ReportRecord.map((item) => ({
          Sno: item.Sno,
          CustomerName: item.CustomerName,
          MobileNo: item.phoneno,
          TotalQuantity: item.ToatlQtykg,
          TotalAmount: item.TotalAmount,
          PendingAmount: item.PendingAmount,
        }));
        setexportdata(transformedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const [exportdata, setexportdata] = useState([])

  const ContentRef = useRef()

  const headers = [
    { label: "Sno", key: "Sno" },
    { label: "Customer Name", key: "CustomerName" },
    { label: "Mobile No", key: "MobileNo" },
    { label: "Total Quantity", key: "TotalQuantity" },
    { label: "Total Amount", key: "TotalAmount" },
    { label: "Pending Amount", key: "PendingAmount" },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  // grid tabel pagination

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentActiveData = Tabledatas.slice(indexOfFirstItem, indexOfLastItem);


  const [show, popup] = useState(false)

  const modalClose = () => popup(false)


  const [customerhistory, setcustomerhistory] = useState([])
  const handlenamehistory = async (customername) => {

    console.log(customername, "customername");

    const alldata = { customerName: customername, fromDate: getData.fromDate, todate: getData.toDate }

    await axios.get(`${apiUrl}/get-customerhistory`, {
      params: alldata
    })
      .then((res) => {
        console.log(res.data);
        setcustomerhistory(res.data)
      })
      .catch((err) => {
        console.log(err);
      })

    popup(true)
  }

  return (
    <div>
      <div className="log-report">

        <div className="search-filter d-flex gap-10 justify-content-center mt-5">
          <div className="from-date">
            <label htmlFor="from-date" className=' form-label '>From Date</label>
            <input type="date" onChange={(e) => setGetdata({ ...getData, fromDate: e.target.value })} className=' form-control ' />
          </div>
          <div className="to-date">
            <label htmlFor="to-date" className=' form-label '>To Date</label>
            <input type="date" onChange={(e) => setGetdata({ ...getData, toDate: e.target.value })} className=' form-control ' />
          </div>
          <div className="to-date pt-2">
            <button type="submit" onClick={SearchData} className='btn btn-dark bg-dark mt-4 '>Search</button>
          </div>
        </div>




        <div className="print-button d-flex align-items-center justify-content-between   mt-4">
          <div className="document ms-auto d-flex gap-3">
            <CSVLink className='btn btn-success  d-flex gap-2 text-dark fw-semibold' data={exportdata} headers={headers} filename={"CustomerWiseSalesReport.csv"}><HiOutlineDownload style={{ fontSize: "20px" }} />Export Data</CSVLink >
            <ReactToPrint trigger={() => (<button className='btn btn-dark d-flex gap-2'><BsFiletypePdf style={{ fontSize: "18px", marginTop: "2px" }} />Save Pdf</button>)}
              content={() => ContentRef.current} />
          </div>

        </div>

        <div className="table-company-datas mt-32 mt-lg-32 mt-xl-5 mt-md-0" ref={ContentRef}>
          <div className="heading mt-3">
            <h1 className='text-4xl fw-semibold text-center mb-2'>Customer Sales Report</h1>
            <hr />
          </div>
          <div className="overflow-auto rounded-lg shadow hidden d-flex ">

            <table className="w-full table-hover">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="w-10 p-3 text-sm font-semibold tracking-wide text-left">Sno</th>
                  <th className="p-3 text-sm font-semibold tracking-wide text-center">Customer Name</th>
                  <th className="p-3 text-sm font-semibold tracking-wide text-center">Mobile No</th>
                  <th className="p-3 text-sm font-semibold tracking-wide text-center">Total Quanity Kg</th>
                  <th className="p-3 text-sm font-semibold tracking-wide text-center">Total Amount</th>
                  <th className="p-3 text-sm font-semibold tracking-wide text-center">Pending Amount</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Tabledatas.length > 0 ? (
                  currentActiveData.map((datas, index) => (
                    <tr className="bg-white">
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                        <p className="font-bold text-blue-500 hover:underline" key={index}>{datas.Sno}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        <a className='nav-link customer-history' onClick={() => handlenamehistory(datas.CustomerName)}>{datas.CustomerName}</a>
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.phoneno}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.ToatlQtykg}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.TotalAmount}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.PendingAmount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center" colSpan="10">
                      <span className='text-xl'>No Data Found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <Modal show={show} animation={true} onHide={modalClose} size="xl" className='ms-0 ms-lg-5 ms-md-5 ms-xl-5'>
        <Modal.Header >
          <h1 className="modal-title fs-5" id="staticBackdropLabel">Customer History</h1>
          <button type="button" className="btn icon-link-hover" onClick={modalClose}><IoIosClose style={{ fontSize: "30px" }} /></button>
        </Modal.Header>
        <Modal.Body>
          <div className="table-company-datas" ref={ContentRef}>
            <div className="overflow-auto rounded-lg shadow hidden d-flex ">

              <table className="w-full table-hover">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="w-10 p-3 text-sm font-semibold tracking-wide text-left">Sno</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">product Name</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Quantity</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Total Amount</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerhistory.map((datas, index) => (
                    <tr className="bg-white">
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                        <p className="font-bold text-blue-500 hover:underline" key={index}>{datas.sno}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.productname}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.qtykg}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.ProductTotalAmount}
                      </td>
                      <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                        {datas.createdate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
        <Pagination className="mt-3 justify-content-end text-black">
          {[...Array(Math.ceil(customerhistory.length / itemsPerPage))].map((_, page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => handlePageChange(page + 1)}
              className='w-10 text-center'>
              {page + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </Modal>
      <Pagination className="mt-3 justify-content-end text-black">

        {[...Array(Math.ceil(Tabledatas.length / itemsPerPage))].map((_, page) => (
          <Pagination.Item
            key={page + 1}
            active={page + 1 === currentPage}
            onClick={() => handlePageChange(page + 1)}
            className='w-10 text-center'>
            {page + 1}
          </Pagination.Item>
        ))}

      </Pagination>
    </div>
  )
}

export default CustomersaleReport