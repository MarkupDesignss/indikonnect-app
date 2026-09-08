export interface DistributorStats {
  cashWallet: number;
  floatingRetailProfit: number;
  directReferral: number;
}

export interface CoinStat {
  name: string;
  value: number;
  color: "yellow" | "green" | "blue";
}

export interface AccountStatus {
  registered: number;
  qualified: number;
  activated: number;
}

export interface DistributorAccount {
  id: string;
  rank: string;
  status: string;
}

export interface DistributorDashboardData {
  stats: DistributorStats;
  coins: CoinStat[];
  accountStatus: AccountStatus;
  accounts: DistributorAccount[];
}
