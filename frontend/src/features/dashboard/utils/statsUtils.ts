import {
  InfrastructureStats,
  EMPTY_STATS,
} from "../types/infrastructure.types";

export const calculateStats = (infrastructures: any[]): InfrastructureStats => {
  const stats: InfrastructureStats = {
    total: infrastructures.length,
    byItemType: {
      POP: 0,
      "Sub POP": 0,
      "BTS-CO-LO": 0,
      "Bandwidth BTS": 0,
      "Office Location": 0,
      NNI: 0,
      "Data Center": 0,
      Customer: 0,
    },
    byCustomer: {
      "Reliance Jio Infocomm Limited": 0,
      "Vodafone Idea Limited": 0,
      "SIFY Technologies Limited": 0,
      "Tata Communications Limited": 0,
      "Bharti Airtel Limited": 0,
    },
    byStatus: {
      Active: 0,
      Inactive: 0,
      Maintenance: 0,
      Planned: 0,
      RFS: 0,
      Damaged: 0,
    },
  };

  const customerNamesFound = new Set<string>();

  infrastructures.forEach((infra) => {
    const infraType = infra.type || infra.item_type;
    if (infraType && infraType in stats.byItemType) {
      stats.byItemType[infraType as keyof typeof stats.byItemType]++;
    }

    if (infraType === "Customer") {
      const customerName = infra.customer_name || infra.customerName;

      if (customerName) {
        customerNamesFound.add(customerName);

        const normalizedName = customerName.trim();
        if (normalizedName in stats.byCustomer) {
          stats.byCustomer[normalizedName as keyof typeof stats.byCustomer]++;
        } else {
          console.warn(
            `Customer name "${normalizedName}" not in expected list (Jio, Tata, Vodafone, Sify, Airtel)`,
          );
        }
      } else {
        console.warn("Customer infrastructure without customer_name:", infra);
      }
    }

    if (infra.status && infra.status in stats.byStatus) {
      stats.byStatus[infra.status as keyof typeof stats.byStatus]++;
    }
  });

  return stats;
};

export const getEmptyStats = (): InfrastructureStats => ({ ...EMPTY_STATS });

