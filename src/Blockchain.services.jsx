
import Web3 from "web3";
import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/DominionDAO.json";

// =====================================
// 1. KHOI TAO WEB3
// =====================================

const { ethereum } = window;

if (ethereum) {
  window.web3 = new Web3(ethereum);
}

// =====================================
// 2. KET NOI METAMASK
// =====================================

const connectWallet = async () => {
  if (!ethereum) {
    alert("Please install MetaMask");
    return;
  }

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    setGlobalState(
      "connectedAccount",
      (accounts[0] || "").toLowerCase()
    );

    window.location.reload();
  } catch (error) {
    reportError(error);
  }
};

// =====================================
// 3. KIEM TRA VI DA KET NOI
// =====================================

let listenersRegistered = false;

const isWallectConnected = async () => {
  if (!ethereum) return;

  try {
    const accounts = await ethereum.request({
      method: "eth_accounts",
    });

    setGlobalState(
      "connectedAccount",
      (accounts[0] || "").toLowerCase()
    );

    if (!listenersRegistered) {
      ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      ethereum.on("accountsChanged", (newAccounts) => {
        setGlobalState(
          "connectedAccount",
          (newAccounts[0] || "").toLowerCase()
        );

        window.location.reload();
      });

      listenersRegistered = true;
    }
  } catch (error) {
    reportError(error);
  }
};

// =====================================
// 4. LAY SMART CONTRACT
// =====================================

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState("connectedAccount");

  if (!ethereum) {
    throw new Error("Please install MetaMask.");
  }

  if (!connectedAccount) {
    throw new Error("Please connect MetaMask first.");
  }

  const contractAddress =
    process.env.REACT_APP_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error(
      "REACT_APP_CONTRACT_ADDRESS is missing in .env"
    );
  }

  if (!window.web3.utils.isAddress(contractAddress)) {
    throw new Error("Invalid contract address.");
  }

  const contract = new window.web3.eth.Contract(
    abi.abi,
    contractAddress
  );

  return contract;
};

// =====================================
// 5. DONG GOP ETH
// =====================================

const performContribute = async (amount) => {
  try {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Please enter a valid ETH amount.");
    }

    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const amountInWei = window.web3.utils.toWei(
      amount.toString(),
      "ether"
    );

    const receipt = await contract.methods
      .contribute()
      .send({
        from: account,
        value: amountInWei,
      });

    if (receipt.status === false) {
      throw new Error("Contribution transaction failed.");
    }

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// =====================================
// 6. LAY THONG TIN DAO
// =====================================

const getInfo = async () => {
  try {
    if (!ethereum) return;

    const connectedAccount =
      getGlobalState("connectedAccount");

    if (!connectedAccount) return;

    const contract = await getEtheriumContract();

    const isStakeholder = await contract.methods
      .isStakeholder()
      .call({ from: connectedAccount });

    const balance = await contract.methods
      .daoBalance()
      .call();

    const mybalance = await contract.methods
      .getBalance()
      .call({ from: connectedAccount });

    setGlobalState(
      "balance",
      window.web3.utils.fromWei(balance, "ether")
    );

    setGlobalState(
      "mybalance",
      window.web3.utils.fromWei(mybalance, "ether")
    );

    setGlobalState("isStakeholder", isStakeholder);
  } catch (error) {
    reportError(error);
  }
};

// =====================================
// 7. TAO PROPOSAL
// =====================================

const raiseProposal = async ({
  title,
  description,
  beneficiary,
  amount,
}) => {
  try {
    if (!title || !description || !beneficiary || !amount) {
      throw new Error("Please fill in all proposal fields.");
    }

    if (Number(amount) <= 0) {
      throw new Error("Proposal amount must be greater than zero.");
    }

    if (!window.web3?.utils.isAddress(beneficiary)) {
      throw new Error("Invalid beneficiary address.");
    }

    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const amountInWei = window.web3.utils.toWei(
      amount.toString(),
      "ether"
    );

    const receipt = await contract.methods
      .createProposal(
        title,
        description,
        beneficiary,
        amountInWei
      )
      .send({ from: account });

    if (receipt.status === false) {
      throw new Error("Create proposal transaction failed.");
    }

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// =====================================
// 8. LAY DANH SACH PROPOSAL
// =====================================

const getProposals = async () => {
  try {
    if (!ethereum) return;

    const connectedAccount =
      getGlobalState("connectedAccount");

    if (!connectedAccount) return;

    const contract = await getEtheriumContract();

    const proposals = await contract.methods
      .getProposals()
      .call();

    setGlobalState(
      "proposals",
      structuredProposals(proposals)
    );
  } catch (error) {
    reportError(error);
  }
};

// =====================================
// 9. CHUAN HOA DU LIEU PROPOSAL
// =====================================

const structuredProposals = (proposals) => {
  return proposals
    .map((proposal) => ({
      id: proposal.id,

      amount: window.web3.utils.fromWei(
        proposal.amount,
        "ether"
      ),

      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse();
};

// =====================================
// 10. LAY CHI TIET MOT PROPOSAL
// =====================================

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState("proposals");

    return proposals.find(
      (proposal) => String(proposal.id) === String(id)
    );
  } catch (error) {
    reportError(error);
    return null;
  }
};

// =====================================
// 11. BO PHIEU PROPOSAL
// =====================================

const voteOnProposal = async (proposalId, supported) => {
  try {
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const receipt = await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account });

    if (receipt.status === false) {
      throw new Error("Vote transaction failed.");
    }

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// =====================================
// 12. LAY DANH SACH NGUOI BO PHIEU
// =====================================

const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract();

    const votes = await contract.methods
      .getVotesOf(id)
      .call();

    return votes;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// =====================================
// 13. THANH TOAN CHO BENEFICIARY
// =====================================

const payoutBeneficiary = async (id) => {
  try {
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const receipt = await contract.methods
      .payBeneficiary(id)
      .send({ from: account });

    if (receipt.status === false) {
      throw new Error("Payout transaction failed.");
    }

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// =====================================
// 14. XU LY LOI
// =====================================

const reportError = (error) => {
  console.error("Blockchain error:", error);
};

// =====================================
// 15. EXPORT FUNCTIONS
// =====================================

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};
