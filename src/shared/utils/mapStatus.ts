const mapStatus = (status: string) => {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'rejected';
    case 'pending':
    case 'in_process':
    case 'in_mediation':
      return 'pending';
    default:
      return 'pending';
  }
};

export { mapStatus };
