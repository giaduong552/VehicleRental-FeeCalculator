function calculateInsuranceFee(days, selected) {
  if (!selected) {
    return 0;
  }

  return days * 50000;
}

module.exports = {
  calculateInsuranceFee,
};
