const cities = $("#city");
const districts = $("#district");
const wards = $("#ward");
const addressDataUrl =
  "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json";

axios.get(addressDataUrl).then(function (response) {
  const data = response.data;
  renderData(data);
});

function renderData(data) {
  data.forEach((city) => {
    cities.append(new Option(city.Name, city.Name));
  });

  cities.on("change", function () {
    districts.empty().append(new Option("District", ""));
    wards.empty().append(new Option("Ward / Town", ""));
    const selectedCity = data.find((city) => city.Name === cities.val());

    if (selectedCity) {
      selectedCity.Districts.forEach((district) => {
        districts.append(new Option(district.Name, district.Name));
      });
    }
  });

  districts.on("change", function () {
    wards.empty().append(new Option("Ward / Town", ""));
    const selectedCity = data.find((city) => city.Name === cities.val());
    const selectedDistrict = selectedCity?.Districts.find(
      (district) => district.Name === districts.val()
    );

    if (selectedDistrict) {
      selectedDistrict.Wards.forEach((ward) => {
        wards.append(new Option(ward.Name, ward.Name));
      });
    }
  });
}
