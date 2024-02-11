const express = require("express");
const cors = require("cors");
const sql = require('mssql');
const server = express();
server.use(cors());
server.use(express.json());


const PORT = process.env.PORT || 3002;

const config = {
  server: 'localhost', 
  database: 'BILLING',
  user: 'sa',
  password: 'tiger',
  options: {
    encrypt: false,
    trustServerCertificate: true,  
  },
};

const db = new sql.ConnectionPool(config);

// Connect to the database
db.connect().then(() => {
  console.log('Connected to the database');
}).catch(err => {
  console.error('Database connection failed:', err);
});





// Login Querys 

server.get('/forgetpassword', (req, res) => {
  const value = "A"
  db.query(`select usercode from billing.dbo.usermaster with(nolock)  where userstatus ='${value}'`, (err, result) => {
    if (err) {
      console.log(err, 'forgetpassword');
    }
    else {
      res.send(result.recordset)
    }
  })
})

server.put('/forgetpassword-change', (req, res) => {
  const { usercode, newpassword, confirmpassword } = req.body;
  db.query(
    `UPDATE billing.dbo.usermaster 
    SET password = '${newpassword}', confirmpassword = '${confirmpassword}' 
    WHERE usercode = '${usercode}'`,
    (err, result) => {
      if (err) {
        console.log(err, 'forgetpassword-change');
      } else {
        res.send(result.recordset);
      }
    }
  );
});

server.put('/changepassword', (req, res) => {
  const { newpassword, confirmpassword, usercode } = req.body
  db.query(`UPDATE billing.dbo.usermaster SET password = '${newpassword}', confirmpassword = '${confirmpassword}' WHERE usercode = '${usercode}'`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result.recordset);
    }
  })
});


server.get('/login', async (req, res) => {
  const name = req.query.name;
  try {
    const result = await db.query`SELECT um.userid,um.usercode,um.username,um.userstatus,utype.Description,um.password FROM usermaster um WITH (NOLOCK) JOIN usertypemaster utype WITH (NOLOCK) ON um.usertype = utype.usertypeid WHERE um.usercode = ${name}`;
    console.log(result);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
});

server.get('/getcompany_data', (req, res) => {
  db.query('SELECT row_number()over(order by companyid desc)Sno,companyname,status,companyid FROM BILLING.dbo.companymaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getcompany_data');
      res.send(result.recordset);
    }
  });
});

server.get('/getbranch_data', (req, res) => {
  db.query('SELECT row_number()over(order by branchid desc)Sno,branchname,status,branchid FROM BILLING.dbo.branchmaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getbranch_data');
      res.send(result.recordset);
    }
  });
});

server.get('/getproduct_data', (req, res) => {
  db.query('SELECT row_number()over(order by productid desc)Sno,productname,status,productid,brachid FROM billing.dbo.product_master', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getproduct_data');
      res.send(result.recordset);
    }
  });
});


server.get('/getsupplier_data', (req, res) => { 
  const status = 'Active'
  const sqlQuery = `
    SELECT row_number() over (order by sm.Supplierid desc) as Sno, 
      sm.Supplierid,
      sm.Suppliername,
      sm.Address,
      sm.phoneno,
      sm.brachid,
      sm.Qtykg,
      sm.Amount,
      pm.productname,
      sm.status
    FROM billing.dbo.suppliermaster as sm
    JOIN billing.dbo.product_master as pm ON pm.productid = sm.productid where sm.status = '${status}'
    ORDER BY sm.Supplierid DESC;
  `;

  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getsupplier_data');
      res.send(result.recordset);
    }
  });
});


server.get('/getcustomer_data', (req, res) => {
  db.query('SELECT row_number()over(order by Customerid desc)Sno,CustomerName,Address,phoneno,status,Customerid FROM billing.dbo.Customer_Matser', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getcustomer_data');
      res.send(result.recordset);
    }
  });
});

server.get('/getPending_amount', (req, res) => {
  const id = req.query.customerid; // Use req.query to get the query parameter  
  db.query(`SELECT  top 1   ISNULL(bt.Pending, 0) AS pending
  FROM BILLING.dbo.Customer_Matser cm
  left join billing.dbo.bill_transaction_history bt ON cm.Customerid = bt.Customerid
  WHERE cm.Customerid = ${id} order by billid desc`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success getPending_amount', result.recordset);
      res.send(result.recordset);
    }
  });
});

server.get('/companyprofile', (req, res) => {
  const status = 'a'
  db.query(`select row_number()over(order by Compinfoid desc)Sno,Compinfoid,Companyname,Address1,Address,Pincode,State,District,CompanyPhoto from BILLING.dbo.Companyprofileinfo
  where delstatus ='${status}' ORDER BY  Compinfoid DESC`, (err, result) => {
    if (err) {
      console.log(err, "companyprofile");
    }
    else {
      res.send(result.recordset)
    }
  })
})

// Dashboard Query

server.get('/overallpurchasesales', (req, res) => {
  try {
    db.query('exec overallpurchasesales', (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log(response);
        res.send(response.recordset)
      }
    })
  } catch (error) {
    console.log(error);
  }
})

server.get('/monthwisepurchasesales', (req, res) => {
  try {
    db.query('exec monthwisepurchasesales', (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log(response);
        res.send(response.recordset)
      }
    })
  } catch (error) {
    console.log(error);
  }
})

server.get('/daywisepurchasesales', (req, res) => {
  try {
    db.query('exec daywisepurchasesales', (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log(response);
        res.send(response.recordset)
      }
    })
  } catch (error) {
    console.log(error);
  }
})





// reports 

server.get('/purchasesalesreport', (req, res) => {
  const { fromDate, toDate } = req.query;
  console.log(fromDate, toDate)
  db.query(`exec purchasesalesreport '${fromDate}','${toDate}'`, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(result);
      res.send(result.recordset)
    }
  })
});

server.get('/customerwisesalesreport', (req, res) => {
  const { fromDate, toDate } = req.query;
  console.log(fromDate, toDate)
  db.query(`exec customerwisesalesreport '${fromDate}','${toDate}'`, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(result);
      res.send(result.recordset)
    }
  })
});


server.get('/get-customerhistory',(req,res)=>{
  const {customerName,fromDate,todate} =req.query
  db.query(`exec individual_customerwisesalesreport '${fromDate}','${todate}','${customerName}'`,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result.recordset);
      res.send(result.recordset)
    }
  })
})


//  insert query
server.post('/post', (req, res) => {
  const { company_name, status, createdby } = req.body
  console.log(company_name, status, createdby);

  const reg = /[^'"\\]+/g;
  var value = company_name.replace(reg, company_name);

  db.query(
    `INSERT INTO billing.dbo.companymaster(companyname,status,createdby) VALUES('${value}','${status}','${createdby}') `,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Companymaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.dbo.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
      } else {
        console.log(result, "sucesss");
        res.status(200).send('Data inserted successfully');
      }
    }
  );
});

server.post('/branch_post', (req, res) => {
  const { companyid, branchname, status, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var value = branchname.replace(reg, branchname);

  db.query(
    `INSERT INTO billing.dbo.branchmaster(companyid, branchname, status, createdby) 
    VALUES ('${companyid}', '${value}', '${status}','${createdBy}')`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Branchmaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.dbo.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      } else {
        console.log(result);
        res.status(200).send('Data inserted successfully');
      }
    }
  );
});

server.post('/Product_post', (req, res) => {
  const status = 'Active'
  const { branchid, productname, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var value = productname.replace(reg, productname);

  db.query(
    `INSERT INTO billing.dbo.product_master(brachid, productname, status, createdby) 
    VALUES ('${branchid}', '${value}', '${status}','${createdBy}')`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Branchmaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.dbo.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      } else {
        console.log(result);
        res.status(200).send('Data inserted successfully');
      }
    }
  );
})


server.post('/supplier_post', async (req, res) => {

  const status = 'Active'
  const { Suppliername, Address, ProductId, phoneno, Qtykg, Amount, createdBy } = req.body

  console.log(Suppliername, Address, ProductId, phoneno, Qtykg, Amount, createdBy);

  const reg = /[^'"\\]+/g;
  var SuppliernameReg = Suppliername.replace(reg, Suppliername);
  var AddressReg = Address.replace(reg, Address);

  const query = `INSERT INTO billing.dbo.suppliermaster(Suppliername,Address,phoneno,createdate,createdby,brachid,Qtykg,Amount,productid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}',getdate(),'${createdBy}','','${Qtykg}','${Amount}','${ProductId}', '${status}')`

  const query_two = `INSERT INTO billing.dbo.suppliermaster_history(Suppliername,Address,phoneno,createdby,brachid,Qtykg,Amount,productid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}','${createdBy}','','${Qtykg}','${Amount}','${ProductId}', '${status}')`

   const query_three = `INSERT INTO billing.dbo.suppliermaster_history_temp(Suppliername,Address,phoneno,createdby,brachid,Qtykg,Amount,productid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}','${createdBy}','','${Qtykg}','${Amount}','${ProductId}', '${status}')`

  try {
    await Promise.all([
      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error inserting data');
        }
        else {
          console.log(result);
        }
      }),
      db.query(query_two, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error inserting data');
        }
        else {
          console.log(result);
        }
      }),
      db.query(query_three, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error inserting data');
        }
        else {
          console.log(result);
        }
      }),

    ])

    res.send("success")
  }
  catch (error) {
    console.log(error);
  }



})


server.post('/Customer_post', (req, res) => {

  const status = 'Active'
  const { customername, Address, phoneno, createdBy } = req.body


  const reg = /[^'"\\]+/g;
  var SuppliernameReg = customername.replace(reg, customername);
  var AddressReg = Address.replace(reg, Address);

  const query = `INSERT INTO billing.dbo.Customer_Matser(CustomerName,Address,phoneno,createdby,brachid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}','${createdBy}','','${status}')`

  db.query(query, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
            console.log(error);
          } else {
            res.send(Result)
          }
        }
      );
      console.log(err);
      res.status(500).send('Error inserting data');
    }
    else {
      res.send(result)
    }
  })
})




server.post('/bill-transcation-post', async (req, res) => {
  try {
    const overalldata = req.body.overalldata

    const pending = req.body.pendingAmount

    const customerAmount = req.body.customerAmount

    const overallamount = req.body.overallamount

    console.log(customerAmount, pending, "pending from api");
    overalldata.forEach((data) => {
      const {
        Suppliername,
        customername,
        productid,
        quantitiy,
        originalQuantity,
        originalprice,
        totalamount,
      } = data;


      console.log(productid,'productid');

      const reg = /[^'"\\]+/g;
      var SuppliernameReg = Suppliername.replace(reg, Suppliername);

      console.log(SuppliernameReg, "SuppliernameReg");

      db.query(
        `INSERT INTO BILLING.dbo.bill_transaction_history (Customerid,Supplierid,productid,Qtykg,ProductTotalAmount,Pending,customerAmount,TotalAmount) 
        VALUES (${customername}, '${SuppliernameReg}', ${productid},${quantitiy},${totalamount},${pending},${customerAmount},${overallamount})`,
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            const totalquantity = originalQuantity - quantitiy;
            const originalPrice = originalprice - totalamount;
            db.query(
              `UPDATE BILLING.dbo.suppliermaster SET Qtykg = '${totalquantity}', Amount = '${originalPrice}',updatedate = getdate() WHERE Suppliername ='${Suppliername}' and productid = ${productid}`,
              (err, response) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(response);
                }
              }
            );
          }
        }
      );
    });
    res.send("Success");
  } catch {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});





server.post('/CompanyProfile_post', (req, res) => {

  const status = 'a'
  const { Companyname, Address1, Address, Pincode, State, District, CompanyPhoto, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var CompanynameReg = Companyname.replace(reg, Companyname);
  var Address1Reg = Address1.replace(reg, Address1);
  var AddressReg = Address.replace(reg, Address);
  var StateReg = State.replace(reg, State);
  var DistrictReg = District.replace(reg, District);
  const query = `INSERT INTO billing.dbo.companyprofileinfo(Companyname,Address1,Address,Pincode,State,District,CompanyPhoto,Createdby,delstatus)
   VALUES('${CompanynameReg}','${Address1Reg}','${AddressReg}','${Pincode}','${StateReg}','${DistrictReg}','${CompanyPhoto}','${createdBy}','${status}')`

  db.query(query, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
          } else {
            res.send(Result)
          }
        }
      );
      res.status(500).send('Error inserting data');
    }
    else {
      res.send(result)
    }
  })
})






// Update query

server.put('/updatecompanydata/:id', (req, res) => {
  const id = req.params.id
  const date = new Date().toLocaleString();
  const { company_name, status, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var CompanynameReg = company_name.replace(reg, company_name);

  db.query(`UPDATE billing.dbo.companymaster SET companyname = '${CompanynameReg}' , status = '${status}' , updatedate = '${date}', createdby = '${createdBy}' where companyid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error update data from updatecompanydata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})

server.put('/updatebranchdata/:id', (req, res) => {
  const id = req.params.id
  const date = new Date().toLocaleString();
  const { branch_name, status, companyid, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = branch_name.replace(reg, branch_name);

  db.query(`UPDATE billing.dbo.branchmaster SET companyid = ${companyid}, branchname = '${RegValue}' , status = '${status}' , updatedate = '${date}' , createdby = '${createdBy}' where branchid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updateproductdata/:id', (req, res) => {
  const id = req.params.id
  const { productname, branchid, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = productname.replace(reg, productname);

  db.query(`UPDATE billing.dbo.product_master SET brachid = ${branchid}, productname = '${RegValue}', createdby = '${createdBy}' where productid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updatesupplierdata/:id', async (req, res) => {
  const id = req.params.id
  const { Suppliername, Address, createdBy, phoneno, totalqty, totalamt, productid } = req.body
  const status = 'Active'
  const reg = /[^'"\\]+/g;
  var RegValue = Suppliername.replace(reg, Suppliername);
  var RegAddress = Address.replace(reg, Address);

  const UpdateQuery = `UPDATE billing.dbo.suppliermaster SET Suppliername = '${RegValue}', Address = '${RegAddress}', phoneno = '${phoneno}', createdby = '${createdBy}',
  Qtykg = '${totalqty}',Amount = '${totalamt}',productid = '${productid}' where Supplierid = ${id}`

  const UpdateQueryhistory = `UPDATE billing.dbo.suppliermaster_history SET Suppliername = '${RegValue}', Address = '${RegAddress}', phoneno = '${phoneno}', createdby = '${createdBy}',
  Qtykg = '${totalqty}',Amount = '${totalamt}',productid = '${productid}' where Supplierid = ${id}`

  const inserquery = `INSERT INTO billing.dbo.suppliermaster_history_temp(Suppliername,Address,phoneno,createdby,brachid,Qtykg,Amount,productid,status)
   VALUES('${RegValue}','${RegAddress}','${phoneno}','${createdBy}','','${totalqty}','${totalamt}','${productid}', '${status}')`
try{
  await Promise.all([
    db.query(UpdateQuery, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
      }
    }),
    db.query(UpdateQueryhistory, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
      }
    }),
    db.query(inserquery, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
      }
    })
    
  ])
  res.send("sucess")
}
catch(error){
  console.log(error);
}

})

server.put('/updatecustomerdata/:id', (req, res) => {
  const id = req.params.id
  const { customername, Address, createdBy, phoneno } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = customername.replace(reg, customername);
  var RegAddress = Address.replace(reg, Address);

  db.query(`UPDATE billing.dbo.Customer_Matser SET customername = '${RegValue}', Address = '${RegAddress}', phoneno = '${phoneno}', createdby = '${createdBy}' where Customerid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
              console.log(error);
            } else {
              res.send(Result)
            }
          }
        );
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updatecompanyprofile/:id', (req, res) => {
  const id = req.params.id;
  const { Companyname, Address1, Address, Pincode, State, District, CompanyPhoto, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var CompanynameReg = Companyname.replace(reg, Companyname);
  var Address1Reg = Address1.replace(reg, Address1);
  var AddressReg = Address.replace(reg, Address);
  var StateReg = State.replace(reg, State);
  var DistrictReg = District.replace(reg, District);

  let updateQuery = `UPDATE billing.dbo.companyprofileinfo SET Companyname = '${CompanynameReg}',Address1 = '${Address1Reg}',
  Address = '${AddressReg}',Pincode = '${Pincode}',State = '${StateReg}',District = '${DistrictReg}',Createdby = '${createdBy}'`;
  // Check if CompanyPhoto is not empty, then include it in the update query
  if (CompanyPhoto !== undefined && CompanyPhoto !== null && CompanyPhoto !== '') {
    updateQuery += `, CompanyPhoto = '${CompanyPhoto}'`;
  }

  updateQuery += ` WHERE Compinfoid = ${id}`;

  db.query(updateQuery, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      console.log(errorMessage);
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
          } else {
            res.send(Result)
          }
        }
      );
      res.status(500).send('Error updating data');
    } else {
      console.log(result);
      res.send(result);
    }
  });
})

// Delete Query

server.delete('/delete_companymaster', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.dbo.companymaster SET Status = '${value}' , createdby = '${createdBy}'  where companyid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_companymaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})
server.delete('/delete_branchmaster', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.dbo.branchmaster SET Status = '${value}' , createdby = '${createdBy}' where branchid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})



server.delete('/delete_products', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.dbo.product_master SET Status = '${value}' , createdby = '${createdBy}' where productid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_suppliers', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.dbo.suppliermaster SET Status = '${value}' , createdby = '${createdBy}' where Supplierid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_customers', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.dbo.Customer_Matser SET Status = '${value}' , createdby = '${createdBy}' where Customerid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_companyprofile', (req, res) => {
  const id = req.body.id
  const value = "i"
  db.query(`UPDATE billing.dbo.companyprofileinfo SET delstatus = '${value}' where Compinfoid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_Companyprofile: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

// Edit Query

server.get('/editcompany_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.companymaster where companyid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/editbranch_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.branchmaster where branchid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/editproduct_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.product_master where productid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/editsupplier_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.suppliermaster where Supplierid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/editCustomer_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.Customer_Matser where Customerid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/editcompanyprofile_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.dbo.companyprofileinfo where Compinfoid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

// DropDown Quers

server.get('/drop-down', (req, res) => {
  db.query('SELECT * FROM billing.dbo.companymaster with(nolock)', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/drop-down-branch', (req, res) => {
  db.query('SELECT * FROM billing.dbo.branchmaster with(nolock)', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});


server.get('/drop-down-product_master', (req, res) => {
  const status = 'Active'
  db.query(`SELECT productid,productname,status FROM billing.dbo.product_master 
  where status = '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/drop-down-suppliermaster', (req, res) => {
  const status = 'Active'
  db.query(`SELECT DISTINCT Suppliername FROM billing.dbo.suppliermaster WHERE Status = '${status}';
  `, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});

server.get('/drop-down-supplierdatas', (req, res) => {
  const status = 'Active'
  const value = req.query.SupplierName || '';
  db.query(`SELECT pm.productname, sm.productid  FROM billing.dbo.product_master AS pm JOIN  billing.dbo.suppliermaster AS sm ON 
  pm.productid = sm.productid WHERE sm.Suppliername = '${value}' AND sm.status = '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});


server.get('/drop-down-supplierquantity', (req, res) => {
  const { quantity, suppliername } = req.query;
  db.query(`SELECT row_number() over (order by Supplierid desc) Sno, Qtykg, Amount FROM billing.dbo.suppliermaster WHERE Suppliername = '${suppliername}' AND productid = '${quantity}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      console.log(result.recordset);
      res.send(result.recordset);
    }
  });
});


server.get('/drop-down-Customername', (req, res) => {
  const status = 'Active'
  db.query(`SELECT CustomerName,Customerid FROM billing.dbo.Customer_Matser where status= '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result.recordset);
    }
  });
});






server.listen(PORT, () => {
  console.log(`Server is connected ${PORT}`);
});


