(function () {
  const { VEHICLES } = window.Constants;
  const { validateVehicle, validateRentalDays } = window.Validation;
  const { validateDiscountCode } = window.Discount;
  const { calculateRentalFee, calculateTotalFee, resetCalculator } =
    window.Calculator;

  let state = resetCalculator();

  // DOM Elements
  const vehicleSelect = document.getElementById("vehicle-select");
  const vehicleError = document.getElementById("vehicle-error");
  const unitPriceDisplay = document.getElementById("unit-price-display");
  const rentalDaysInput = document.getElementById("rental-days");
  const daysError = document.getElementById("days-error");

  const cbInsurance = document.getElementById("service-insurance");
  const cbDelivery = document.getElementById("service-delivery");
  const cbDriver = document.getElementById("service-driver");

  const switchInsurance = document.getElementById("switch-insurance");
  const switchDelivery = document.getElementById("switch-delivery");
  const switchDriver = document.getElementById("switch-driver");
  const rowDriver = document.getElementById("row-driver");

  const discountInput = document.getElementById("discount-input");
  const applyDiscountBtn = document.getElementById("apply-discount-btn");
  const discountMessage = document.getElementById("discount-message");

  const calculateBtn = document.getElementById("calculate-btn");
  const resetBtn = document.getElementById("reset-btn");
  const headerResetBtn = document.getElementById("header-reset-btn");

  const invoiceEmpty = document.getElementById("invoice-empty");
  const invoiceContent = document.getElementById("invoice-content");

  const invVehicleName = document.getElementById("inv-vehicle-name");
  const invUnitPrice = document.getElementById("inv-unit-price");
  const invRentalDays = document.getElementById("inv-rental-days");
  const invRentalFee = document.getElementById("inv-rental-fee");
  const invInsuranceFee = document.getElementById("inv-insurance-fee");
  const invDeliveryFee = document.getElementById("inv-delivery-fee");
  const invDriverFee = document.getElementById("inv-driver-fee");
  const invTotalExtraFee = document.getElementById("inv-total-extra-fee");
  const invDiscountCode = document.getElementById("inv-discount-code");
  const invDiscountAmount = document.getElementById("inv-discount-amount");
  const invTotalPayment = document.getElementById("inv-total-payment");

  /**
   * Định dạng số tiền theo chuẩn Việt Nam (VD: 1.400.000đ)
   */
  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  /**
   * Đồng bộ giao diện nút Toggle Switch của Bee Tools theo trạng thái checkbox
   */
  function syncToggleSwitchUI(switchEl, isChecked) {
    if (!switchEl) return;
    const knob = switchEl.querySelector(".vrc-toggle-knob");
    if (isChecked) {
      switchEl.classList.remove("off");
      switchEl.classList.add("on");
      if (knob) {
        knob.classList.remove("off");
        knob.classList.add("on");
      }
    } else {
      switchEl.classList.remove("on");
      switchEl.classList.add("off");
      if (knob) {
        knob.classList.remove("on");
        knob.classList.add("off");
      }
    }
  }

  /**
   * Ẩn hóa đơn cũ khi người dùng thay đổi bất kỳ dữ liệu nào sau khi tính
   */
  function hideInvoiceOnDataChange() {
    state.invoice = null;
    invoiceContent.style.display = "none";
    invoiceEmpty.style.display = "flex";
  }

  /**
   * Hiển thị hoặc ẩn thông báo ở phần Mã giảm giá
   */
  function renderDiscountBanner(type, message) {
    if (!message) {
      discountMessage.style.display = "none";
      discountMessage.textContent = "";
      discountMessage.className = "vrc-status-banner";
      return;
    }
    discountMessage.style.display = "flex";
    discountMessage.className = `vrc-status-banner ${type}`;
    discountMessage.textContent = message;
  }

  /**
   * Hiển thị lỗi cho từng trường nhập liệu
   */
  function setFieldError(inputEl, errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent = message || "";
    if (inputEl) {
      if (message) {
        inputEl.classList.add("input-error");
      } else {
        inputEl.classList.remove("input-error");
      }
    }
  }

  /**
   * Kiểm tra lại điều kiện mã giảm giá khi thay đổi loại xe hoặc số ngày thuê
   */
  function revalidateAppliedDiscount() {
    const rawCode = discountInput.value;
    if (!state.appliedDiscountCode && rawCode.trim() === "") {
      return;
    }

    const codeToCheck = state.appliedDiscountCode || rawCode;
    if (!codeToCheck || codeToCheck.trim() === "") {
      return;
    }

    const vCheck = validateVehicle(vehicleSelect.value);
    const dCheck = validateRentalDays(rentalDaysInput.value);
    const currentRentalFee =
      vCheck.valid && dCheck.valid
        ? calculateRentalFee(vCheck.vehicle.id, dCheck.days)
        : 0;

    const dResult = validateDiscountCode(codeToCheck, currentRentalFee);
    if (!dResult.valid) {
      state.appliedDiscountCode = "";
      renderDiscountBanner("error", dResult.message);
    } else if (!dResult.isEmpty) {
      state.appliedDiscountCode = dResult.code;
      renderDiscountBanner("success", dResult.message);
    }
  }

  /**
   * Xử lý khi thay đổi loại xe
   */
  function handleVehicleChange() {
    const selectedId = vehicleSelect.value;
    state.vehicleId = selectedId;
    hideInvoiceOnDataChange();

    const vCheck = validateVehicle(selectedId);
    if (vCheck.valid) {
      setFieldError(vehicleSelect, vehicleError, "");
      unitPriceDisplay.textContent = `${formatCurrency(vCheck.vehicle.price)}/ngày`;

      if (vCheck.vehicle.type === "car") {
        // Khi chuyển sang ô tô: kích hoạt checkbox tài xế nhưng không tự động chọn lại
        cbDriver.disabled = false;
        rowDriver.classList.remove("disabled");
      } else {
        // Khi chọn xe máy: vô hiệu hóa và tự động bỏ lựa chọn thuê tài xế
        cbDriver.checked = false;
        cbDriver.disabled = true;
        state.driver = false;
        rowDriver.classList.add("disabled");
        syncToggleSwitchUI(switchDriver, false);
      }
    } else {
      unitPriceDisplay.textContent = "0đ/ngày";
      cbDriver.checked = false;
      cbDriver.disabled = true;
      state.driver = false;
      rowDriver.classList.add("disabled");
      syncToggleSwitchUI(switchDriver, false);
    }

    revalidateAppliedDiscount();
  }

  /**
   * Xử lý khi người dùng nhập số ngày thuê
   */
  function handleDaysInput() {
    state.rentalDays = rentalDaysInput.value;
    hideInvoiceOnDataChange();

    const dCheck = validateRentalDays(rentalDaysInput.value);
    if (dCheck.valid) {
      setFieldError(rentalDaysInput, daysError, "");
    } else if (rentalDaysInput.value.trim() !== "") {
      setFieldError(rentalDaysInput, daysError, dCheck.error);
    } else {
      setFieldError(rentalDaysInput, daysError, "");
    }

    revalidateAppliedDiscount();
  }

  /**
   * Xử lý khi nhấn nút ÁP DỤNG mã giảm giá
   */
  function handleApplyDiscount() {
    hideInvoiceOnDataChange();
    const rawCode = discountInput.value;

    if (!rawCode || rawCode.trim() === "") {
      state.appliedDiscountCode = "";
      renderDiscountBanner("", "");
      return;
    }

    // Kiểm tra sự tồn tại của mã trước, sau đó kiểm tra điều kiện đơn thuê
    const vCheck = validateVehicle(vehicleSelect.value);
    const dCheck = validateRentalDays(rentalDaysInput.value);
    const currentRentalFee =
      vCheck.valid && dCheck.valid
        ? calculateRentalFee(vCheck.vehicle.id, dCheck.days)
        : 0;

    const result = validateDiscountCode(rawCode, currentRentalFee);
    if (result.valid && !result.isEmpty) {
      state.appliedDiscountCode = result.code;
      renderDiscountBanner("success", result.message);
    } else {
      state.appliedDiscountCode = "";
      renderDiscountBanner("error", result.message);
    }
  }

  /**
   * Xử lý khi nhấn nút TÍNH PHÍ THUÊ XE
   */
  function handleCalculate() {
    const vCheck = validateVehicle(vehicleSelect.value);
    const dCheck = validateRentalDays(rentalDaysInput.value);

    setFieldError(
      vehicleSelect,
      vehicleError,
      vCheck.valid ? "" : vCheck.error,
    );
    setFieldError(rentalDaysInput, daysError, dCheck.valid ? "" : dCheck.error);

    if (!vCheck.valid || !dCheck.valid) {
      hideInvoiceOnDataChange();
      return;
    }

    const rentalFee = calculateRentalFee(vCheck.vehicle.id, dCheck.days);
    const rawDiscount = discountInput.value;

    let codeForCalc = "";
    if (rawDiscount.trim() !== "") {
      const dValidation = validateDiscountCode(rawDiscount, rentalFee);
      if (!dValidation.valid) {
        state.appliedDiscountCode = "";
        renderDiscountBanner("error", dValidation.message);
        hideInvoiceOnDataChange();
        return;
      }
      state.appliedDiscountCode = dValidation.code;
      codeForCalc = dValidation.code;
      renderDiscountBanner("success", dValidation.message);
    } else {
      state.appliedDiscountCode = "";
      renderDiscountBanner("", "");
    }

    const calcResult = calculateTotalFee({
      vehicleId: vehicleSelect.value,
      rentalDays: rentalDaysInput.value,
      insurance: cbInsurance.checked,
      delivery: cbDelivery.checked,
      driver: cbDriver.checked,
      discountCode: codeForCalc,
    });

    if (!calcResult.valid || !calcResult.data) {
      hideInvoiceOnDataChange();
      return;
    }

    const { data } = calcResult;
    state.invoice = data;

    invVehicleName.textContent = data.vehicleName;
    invUnitPrice.textContent = `${formatCurrency(data.unitPrice)}/ngày`;
    invRentalDays.textContent = `${data.rentalDays} ngày`;
    invRentalFee.textContent = formatCurrency(data.rentalFee);

    invInsuranceFee.textContent = formatCurrency(data.insuranceFee);
    invDeliveryFee.textContent = formatCurrency(data.deliveryFee);
    invDriverFee.textContent = formatCurrency(data.driverFee);
    invTotalExtraFee.textContent = formatCurrency(data.totalExtraFee);

    invDiscountCode.textContent = data.discountCode;
    invDiscountAmount.textContent = formatCurrency(data.discountAmount);
    invTotalPayment.textContent = formatCurrency(data.totalPayment);

    invoiceEmpty.style.display = "none";
    invoiceContent.style.display = "block";
  }

  /**
   * Xử lý khi nhấn nút ĐẶT LẠI
   */
  function handleReset() {
    state = resetCalculator();

    vehicleSelect.value = "";
    rentalDaysInput.value = "";
    unitPriceDisplay.textContent = "0đ/ngày";

    cbInsurance.checked = false;
    cbDelivery.checked = false;
    cbDriver.checked = false;
    cbDriver.disabled = true;
    rowDriver.classList.add("disabled");

    syncToggleSwitchUI(switchInsurance, false);
    syncToggleSwitchUI(switchDelivery, false);
    syncToggleSwitchUI(switchDriver, false);

    discountInput.value = "";
    setFieldError(vehicleSelect, vehicleError, "");
    setFieldError(rentalDaysInput, daysError, "");
    renderDiscountBanner("", "");

    invoiceContent.style.display = "none";
    invoiceEmpty.style.display = "flex";
  }

  // Event Listeners
  vehicleSelect.addEventListener("change", handleVehicleChange);
  rentalDaysInput.addEventListener("input", handleDaysInput);

  cbInsurance.addEventListener("change", () => {
    state.insurance = cbInsurance.checked;
    syncToggleSwitchUI(switchInsurance, cbInsurance.checked);
    hideInvoiceOnDataChange();
  });

  cbDelivery.addEventListener("change", () => {
    state.delivery = cbDelivery.checked;
    syncToggleSwitchUI(switchDelivery, cbDelivery.checked);
    hideInvoiceOnDataChange();
  });

  cbDriver.addEventListener("change", () => {
    if (cbDriver.disabled) {
      cbDriver.checked = false;
      return;
    }
    state.driver = cbDriver.checked;
    syncToggleSwitchUI(switchDriver, cbDriver.checked);
    hideInvoiceOnDataChange();
  });

  discountInput.addEventListener("input", () => {
    state.appliedDiscountCode = "";
    hideInvoiceOnDataChange();
    if (discountInput.value.trim() === "") {
      renderDiscountBanner("", "");
    }
  });

  applyDiscountBtn.addEventListener("click", handleApplyDiscount);
  calculateBtn.addEventListener("click", handleCalculate);
  resetBtn.addEventListener("click", handleReset);
  headerResetBtn.addEventListener("click", handleReset);
})();
