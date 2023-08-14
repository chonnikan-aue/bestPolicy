import axios from "axios";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { CenterPage } from "../StylesPages/AdminStyles";
import { Container } from "../StylesPages/PagesLayout";
import { async } from "q";
const config = require("../../config.json");

const PolicyCard = (props) => {
  const index = props.index;
  const url = config.url;

  //import excel
  const [formData, setFormData] = useState(props.formData);
  const [provinceDD, setProvinceDD] = useState([]);
  const [districDD, setDistricDD] = useState([]);
  const [subDistricDD, setSubDistricDD] = useState([]);
  const [zipcodeDD, setZipCodeDD] = useState([]);
  const [titleDD, setTitleDD] = useState([]);
  const [insureTypeDD, setInsureTypeDD] = useState([]);
  const [insureClassDD, setInsureClassDD] = useState([]);
  const [insureSubClassDD, setInsureSubClassDD] = useState([]);
  const [insurerDD, setInsurerDD] = useState([]);

  const handleChange = async (e) => {
    e.preventDefault();

    //set dropdown subclass when class change
    if (e.target.name === "class") {
      const array = [];
      insureTypeDD.forEach((ele) => {
        if (e.target.value === ele.class) {
          array.push(
            <option key={ele.id} value={ele.subClass}>
              {ele.subClass}
            </option>
          );
        }
      });
      setInsureSubClassDD(array);
    }
    //  set totalprem
    if (
      formData.duty !== null &&
      formData.tax !== null &&
      formData.grossprem !== null
    ) {
      const newTotalPrem =
        parseFloat(formData.grossprem) -
        parseFloat(formData.duty) -
        parseFloat(formData.tax);
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
        totalprem: newTotalPrem,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
      }));
    }

    //set dropdown title follow to personType
    if (e.target.name === "personType") {
      if (e.target.value === "P") {
        axios
          .get(url + "/static/titles/person/all")
          .then((title) => {
            const array2 = [];
            title.data.forEach((ele) => {
              array2.push(
                <option key={ele.TITLEID} value={ele.TITLEID}>
                  {ele.TITLETHAIBEGIN}
                </option>
              );
            });
            setTitleDD(array2);
          })
          .catch((err) => {});
      } else {
        axios
          .get(url + "/static/titles/company/all")
          .then((title) => {
            const array2 = [];
            title.data.forEach((ele) => {
              array2.push(
                <option key={ele.TITLEID} value={ele.TITLEID}>
                  {ele.TITLETHAIBEGIN}
                </option>
              );
            });
            setTitleDD(array2);
          })
          .catch((err) => {});
      }
    }

    //set dropdown distric subdistric
    if (e.target.name === "province") {
      console.log(e.target.id);
      getDistrict(e.target.id);
    } else if (e.target.name === "district") {
      getSubDistrict(e.target.id);
    }

    //get com/ov setup
    
    console.log( formData.insurerName !== null &&
      formData.class !== null &&
      formData.subClass !== null );
  };

  const getDistrict = (provinceID) => {
    //get distric in province selected
    axios
      .get(url + "/static/amphurs/" + provinceID)
      .then((distric) => {
        const array = [];
        distric.data.forEach((ele) => {
          array.push(
            <option id={ele.amphurid} value={ele.t_amphurname}>
              {ele.t_amphurname}
            </option>
          );
        });
        setDistricDD(array);
      })
      .catch((err) => {
        // alert("cant get aumphur");
      });
  };

  const getcommov = (e) => {
    e.preventDefault();
    //get comm  ov setup
    axios
      .post(url + "/insures/getcommov",formData)
      .then((res) => {
        console.log(res.data);
        setFormData((prevState) => ({
          ...prevState,
          [`commIn%`]: res.data[0].rateComIn,
          [`ovIn%`]: res.data[0].rateOVIn_1,
          [`commOut%`]: res.data[0].rateComOut,
          [`ovOut%`]: res.data[0].rateOVOut_1,
        }));
      })
      .catch((err) => {
        // alert("cant get aumphur");
      });
    
      // if (formData[`commIn%`] == null && formData[`ovIn%`] == null ) {
      //   setFormData((prevState) => ({
      //     ...prevState,
      //     [`commIn%`]: 10,
      //     [`ovIn%`]: 15,
      //   }));
        
      // }
      //  if (formData[`commOut%`] == null && formData[`ovOut%`] == null){
      //   setFormData((prevState) => ({
      //     ...prevState,
      //     [`commOut%`]: 10,
      //     [`ovOut%`]: 15,
      //   }));
      // }


    }

  

  const getSubDistrict = (districID) => {
    //get tambons in distric selected
    axios
      .get(url + "/static/tambons/" + districID)
      .then((subdistric) => {
        const arraySub = [];
        const arrayZip = [];
        const zip = [];
        subdistric.data.forEach((ele) => {
          arraySub.push(
            <option id={ele.tambonid} value={ele.t_tambonname}>
              {ele.t_tambonname}
            </option>
          );
          zip.push(ele.postcodeall.split("/"));
        });
        const uniqueZip = [...new Set(...zip)];
        console.log(uniqueZip);
        uniqueZip.forEach((zip) => {
          arrayZip.push(<option value={zip}>{zip}</option>);
        });
        setSubDistricDD(arraySub);
        setZipCodeDD(arrayZip);
      })
      .catch((err) => {
        // alert("cant get tambons");
      });
  };

  const handleSubmit = async (e) => {
    const data = [];
    for (let i = 0; i < formData.length; i++) {
      let t_ogName = null;
      let t_firstName = null;
      let t_lastName = null;
      let idCardType = "idcard";
      let idCardNo = null;
      let taxNo = null;
      if (formData[i].personType === "P") {
        t_firstName = formData[i].t_fn;
        t_lastName = formData[i].t_ln;
        idCardNo = formData[i].regisNo.toString();
        data.push({
          ...formData[i],
          t_firstName: t_firstName,
          t_lastName: t_lastName,
          idCardNo: idCardNo,
          idCardType: idCardType,
          t_ogName: t_ogName,
          taxNo: taxNo,
        });
      } else {
        t_ogName = formData[i].t_fn;

        taxNo = formData[i].regisNo.toString();
        data.push({
          ...formData[i],
          t_ogName: t_ogName,
          taxNo: taxNo,
          t_firstName: t_firstName,
          t_lastName: t_lastName,
          idCardNo: idCardNo,
          idCardType: idCardType,
        });
      }
    }
    console.log(data);
    e.preventDefault();
    await axios.post(url + "/policies/policynew/batch", data).then((res) => {
      alert("policy batch Created");
      window.location.reload(false);
    });
  };
  useEffect(() => {
    //get province
    axios
      .get(url + "/static/provinces/all")
      .then((province) => {
        // let token = res.data.jwt;
        // let decode = jwt_decode(token);
        // navigate("/");
        // window.location.reload();
        // localStorage.setItem("jwt", token);

        const array = [];
        province.data.forEach((ele) => {
          array.push(
            <option id={ele.provinceid} value={ele.t_provincename}>
              {ele.t_provincename}
            </option>
          );
        });
        setProvinceDD(array);
        // get title
        axios
          .get(url + "/static/titles/company/all")
          .then((title) => {
            const array2 = [];
            title.data.forEach((ele) => {
              array2.push(
                <option key={ele.TITLEID} value={ele.TITLEID}>
                  {ele.TITLETHAIBEGIN}
                </option>
              );
            });
            setTitleDD(array2);
          })
          .catch((err) => {});
      })
      .catch((err) => {});
    // get title all of company type

    //get insureType
    axios
      .get(url + "/insures/insuretypeall")
      .then((insuretype) => {
        // let token = res.data.jwt;
        // let decode = jwt_decode(token);
        // navigate("/");
        // window.location.reload();
        // localStorage.setItem("jwt", token);

        const array = [];
        insuretype.data.forEach((ele) => {
          array.push(
            <option key={ele.id} value={ele.class}>
              {ele.class}
            </option>
          );
        });
        setInsureTypeDD(insuretype.data);
        setInsureClassDD(array);
      })
      .catch((err) => {});

    //get insurer
    axios
      .get(url + "/persons/insurerall")
      .then((insurer) => {
        // let token = res.data.jwt;
        // let decode = jwt_decode(token);
        // navigate("/");
        // window.location.reload();
        // localStorage.setItem("jwt", token);

        const array = [];
        insurer.data.forEach((ele) => {
          array.push(
            <option key={ele.id} value={ele.insurerCode}>
              {ele.t_ogName}
            </option>
          );
        });
        setInsurerDD(array);
      })
      .catch((err) => {
        // alert("cant get province");
      });
  }, []);

  return (
    <div>
      <h1 className="text-center">กรมธรรม์ฉบับที่ {parseInt(index) + 1}</h1>
      {/* policy table */}
      <div className="row form-group form-inline ">
        <div className="col-1"></div>
        <div className="col-2 form-group  ">
          <label class="form-label ">
            เลขที่กรมธรรม์<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            value={formData.policyNo || ''}
            name={`policyNo`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2 form-group ">
          <label class="form-label">
            วันที่เริ่มคุ้มครอง<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="date"
            defaultValue={formData.actDate}
            name={`actDate`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2 form-group ">
          <label class="form-label ">
            วันที่สิ้นสุด<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="date"
            defaultValue={formData.expDate}
            name={`expDate`}
            onChange={handleChange}
          />
        </div>
        <div class="col-3">{/* null */}</div>
      </div>

      <div class="row">
        <div className="col-1"></div>
        <div class="col-2 form-group ">
          <label class="form-label px-3">
            บริษัทรับประกัน<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`insurerName`}
            onChange={handleChange}
          >
            <option value={formData.insurerName} selected disabled hidden>
              {formData.insurerName}
            </option>
            {insurerDD}
          </select>
        </div>

        <div class="col-2 form-group ">
          <label class="form-label px-3">
            รหัสผู้แนะนำ<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            defaultValue={formData.agentCode}
            name={`agentCode`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2 form-group ">
          <label class="form-label ">
            Class<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`class`}
            onChange={handleChange}
          >
            <option value={formData.class} selected disabled hidden>
              {formData.class}
            </option>
            {insureClassDD}
          </select>
        </div>

        <div class="col-2">
          <label class="form-label ">
            Subclass<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`subClass`}
            onChange={handleChange}
          >
            <option value={formData.subClass} selected disabled hidden>
              {formData.subClass}
            </option>
            {insureSubClassDD}
          </select>
        </div>
      </div>
      {/* policy table */}

      <div class="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            ค่าเบี้ย<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData.grossprem}
            name={`grossprem`}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">
            ภาษี<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData.tax}
            name={`tax`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">
            ค่าแสตมอากรณ์<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData.duty}
            name={`duty`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">
            ค่าเบี้ยรวม<span class="text-danger"> *</span>
          </label>
          <input
            type="number" // Use an input element for displaying numbers
            className="form-control"
            // value={formData.totalprem} // Display the totalprem value from the state
            value = { parseFloat(formData.grossprem) -
              parseFloat(formData.duty) -
              parseFloat(formData.tax)}
            step={0.1}
            name={`totalprem`}
            readOnly
          />
        </div>
      </div>

      <div class="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            comm_in%<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData[`commIn%`]}
            name={`commIn%`}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            จำนวนเงิน<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            disabled
            step={0.1}
            value={(formData[`commIn%`] * formData[`grossprem`]) / 100 || ""}
            name={`commInamt`}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">
            OV_in %<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData[`ovIn%`]}
            name={`ovIn%`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">
            จำนวนเงิน<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            disabled
            step={0.1}
            name={`ovInamt`}
            value={(formData[`ovIn%`] * formData[`grossprem`]) / 100 || ""}
            onChange={handleChange}
          />
        </div>
        
      </div>

      <div className="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            comm_out%<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData[`commOut%`]}
            name={`commOut%`}
            onChange={handleChange}
          />
        </div>

        <div class="col-2">
          <label class="form-label ">จำนวนเงิน</label>
          <input
            className="form-control"
            type="number"
            disabled
            step={0.1}
            value={(formData[`commOut%`] * formData[`grossprem`]) / 100 || ""}
            name={`commOutamt`}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            OV_out %<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="number"
            step={0.1}
            value={formData[`ovOut%`]}
            name={`ovOut%`}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">จำนวนเงิน</label>
          <input
            className="form-control"
            type="number"
            disabled
            step={0.1}
            name={`ovOutamt`}
            value={(formData[`ovOut%`] * formData[`grossprem`]) / 100 || ""}
            onChange={handleChange}
          />
        </div>

        <div class="col-2 align-bottom">
          
        <button type="button" class="btn btn-primary align-bottom" onClick={getcommov} >defualt comm/ov</button>
        </div>
      </div>
      {/* entity table */}
      <div class="row">
        <div className="col-1"></div>
        <div class="col-1">
          <label class="form-label ">
            type<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`personType`}
            onChange={handleChange}
          >
            <option value={formData.personType} disabled selected hidden>
              {formData.personType}
            </option>
            <option value="P">บุคคล</option>
            <option value="C">นิติบุคคล</option>
          </select>
        </div>

        <div class="col-1">
          <label class="form-label ">
            คำนำหน้า<span class="text-danger"> </span>
          </label>
          <select
            className="form-control"
            name={`title`}
            onChange={handleChange}
          >
            <option value={formData.title} disabled selected hidden>
              {formData.title}
            </option>
            {titleDD}
          </select>
        </div>

        <div class="col-2">
          <label class="form-label ">
            ชื่อ<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            defaultValue={formData.t_fn}
            name={`t_fn`}
            onChange={handleChange}
          />
        </div>
        {formData.personType === "P" ? (
          <div class="col-2">
            <label class="form-label ">
              นามสกุล<span class="text-danger"> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              defaultValue={formData.t_ln}
              name={`t_ln`}
              onChange={handleChange}
            />
          </div>
        ) : (
          <div class="col-2">
            <label class="form-label ">
              นามสกุล<span class="text-danger"></span>
            </label>
            <input
              className="form-control"
              type="text"
              readOnly
              defaultValue={formData.t_ln}
              name={`t_ln`}
              onChange={handleChange}
            />
          </div>
        )}

        <div class="col-2">
          <label class="form-label ">
            เลขประจำตัว<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            defaultValue={formData.regisNo}
            name={`regisNo`}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* location table */}
      <div class="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            บ้านเลขที่<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            name={`t_location_1`}
            defaultValue={formData.t_location_1}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            หมู่บ้าน/อาคาร<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            name={`t_location_2`}
            defaultValue={formData.t_location_2}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            หมู่<span class="text-danger"> *</span>
          </label>
          <input
            type="text"
            className="form-control"
            name={`t_location_3`}
            defaultValue={formData.t_location_3}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            ซอย<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            name={`t_location_4`}
            defaultValue={formData.t_location_4}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            ถนน<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            name={`t_location_5`}
            defaultValue={formData.t_location_5}
            onChange={handleChange}
          />
        </div>
      </div>
      <div class="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            จังหวัด<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`province`}
            onChange={handleChange}
          >
            <option value={formData.province} disabled selected hidden>
              {formData.province}
            </option>
            {provinceDD}
          </select>
        </div>
        <div class="col-2">
          <label class="form-label ">
            อำเภอ<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`district`}
            onChange={handleChange}
          >
            <option value={formData.distric} disabled selected hidden>
              {formData.distric}
            </option>
            {districDD}
          </select>
        </div>
        <div class="col-2">
          <label class="form-label ">
            ตำบล<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`subdistrict`}
            onChange={handleChange}
          >
            <option value={formData.subdistric} disabled selected hidden>
              {formData.subdistric}
            </option>
            {subDistricDD}
          </select>
        </div>
        <div class="col-2">
          <label class="form-label ">
            รหัสไปรษณี<span class="text-danger"> *</span>
          </label>
          <select
            className="form-control"
            name={`zipcode`}
            onChange={handleChange}
          >
            <option value={formData.zipcode} disabled selected hidden>
              {formData.zipcode}
            </option>
            {zipcodeDD}
          </select>
        </div>
      </div>
      {/* motor table */}
      {"Motor" === "Motor" ? (
        <>
          <div class="row">
            <div className="col-1"></div>
            <div class="col-2">
              <label class="form-label ">
                เลขทะเบียนรถ<span class="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                name={`carRegisNo`}
                defaultValue={formData.carRegisNo}
                onChange={handleChange}
              />
            </div>
            <div class="col-2">
              <label class="form-label ">
                ยี่ห้อรถยนต์<span class="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                name={`brandID`}
                defaultValue={formData.brandID}
                onChange={handleChange}
              />
            </div>
            <div class="col-2">
              <label class="form-label ">
                รุ่น<span class="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                name={`modelID`}
                defaultValue={formData.modelID}
                onChange={handleChange}
              />
            </div>
            <div class="col-2">
              <label class="form-label ">
                เลขตัวถังรถ<span class="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                name={`chassisNo`}
                defaultValue={formData.chassisNo}
                onChange={handleChange}
              />
            </div>
            <div class="col-2">
              <label class="form-label ">
                ปีที่จดทะเบียน<span class="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                name={`carRegisYear`}
                defaultValue={formData.carRegisYear}
                onChange={handleChange}
              />
            </div>
          </div>
        </>
      ) : null}
      <div class="row">
        <div className="col-1"></div>
        <div class="col-2">
          <label class="form-label ">
            เบอร์โทรศัพท์<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            defaultValue={formData.telNum_1}
            name={`telNum_1`}
            onChange={handleChange}
          />
        </div>
        <div class="col-2">
          <label class="form-label ">
            Email<span class="text-danger"> *</span>
          </label>
          <input
            className="form-control"
            type="text"
            defaultValue={formData.Email}
            name={`Email`}
            onChange={handleChange}
          />
        </div>
      </div>
      <div class="d-flex justify-content-center">

      <button className="p-2 btn btn-primary" name="saveChange" onClick={e=>props.setFormData(e,props.index,formData)}>
      Save Changes
          </button>
          <button  className="p-2 btn btn-secondary " name="closed" onClick={e=>props.setFormData(e)}>
            Close
          </button>
      </div>
    </div>
  );
};

export default PolicyCard;
