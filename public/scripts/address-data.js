const cities = document.getElementById("city");
const districts = document.getElementById("district");
const wards = document.getElementById("ward");
const address_data = {
  url: "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json",
  method: "GET",
  responseType: "json",
};
const promise = axios(address_data);
promise.then(function (result) {
  renderCity(result.data);
});

function renderCity(data) {
  for (const x of data) {
    cities.options[cities.options.length] = new Option(x.Name, x.Name);
  }
  cities.onchange = function () {
    districts.length = 1;
    wards.length = 1;
    if (this.value != "") {
      const result = data.filter((n) => n.Name === this.value);

      for (const k of result[0].Districts) {
        districts.options[districts.options.length] = new Option(
          k.Name,
          k.Name
        );
      }
    }
  };
  districts.onchange = function () {
    wards.length = 1;
    const dataCity = data.filter((n) => n.Name === cities.value);
    if (this.value != "") {
      const dataWards = dataCity[0].Districts.filter(
        (n) => n.Name === this.value
      )[0].Wards;

      for (const w of dataWards) {
        wards.options[wards.options.length] = new Option(w.Name, w.Name);
      }
    }
  };
}
