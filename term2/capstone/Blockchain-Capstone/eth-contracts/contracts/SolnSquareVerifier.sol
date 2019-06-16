pragma solidity ^0.5.0;

import "./ERC721Mintable.sol";


contract IVerifier {
    function verifyTx(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) public returns (bool r);
}


contract SolnSquareVerifier is CustomERC721Token {
    IVerifier private _verifier;

    struct Solution {
        address owner;
        bool minted;

        uint[2] a;
        uint[2][2] b;
        uint[2] c;
        uint[2] input;
    }

    mapping(bytes32 => Solution) private _uniqueSolutions;

    event SolutionAdded(address owner, bytes32 key);

    constructor(address verifierContract) public {
        _verifier = IVerifier(verifierContract);
    }

    function addSolution(uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input) public whenNotPaused {
        bytes32 key = keccak256(abi.encodePacked(a, b, c, input));
        require(_uniqueSolutions[key].owner == address(0), "only new solutions can be added");
        Solution memory s = Solution(msg.sender, false, a, b, c, input);
        _uniqueSolutions[key] = s;
        emit SolutionAdded(msg.sender, key);
    }

    function issueToken(bytes32 key) public whenNotPaused {
        Solution memory s = _uniqueSolutions[key];
        require(s.owner != address(0), "solution must be submitted before minting");
        require(!s.minted, "token already minted for this solution");
        require(_verifier.verifyTx(s.a, s.b, s.c, s.input), "invalid solution");
        uint256 tokenId = super.totalSupply();
        super.mint(s.owner, tokenId);
        _uniqueSolutions[key].minted = true;
    }
}
