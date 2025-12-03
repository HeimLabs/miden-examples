export const COUNTER_CONTRACT_ADDRESS = "mtst1arjemrxne8lj5qz4mg9c8mtyxg954483";
export const NODE_ENDPOINT = "https://rpc.testnet.miden.io";

export const COUNTER_CONTRACT_CODE = `
  use.miden::active_account
  use.miden::native_account
  use.std::sys

  const.COUNTER_SLOT=0

  export.get_count
      push.COUNTER_SLOT
      exec.active_account::get_item
      movdn.4 dropw
  end

  export.increment_count
      push.COUNTER_SLOT
      exec.active_account::get_item
      add.1
      push.COUNTER_SLOT
      exec.native_account::set_item
      dropw
  end
`;
