// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
pragma experimental ABIEncoderV2;

contract PRH {
    struct hospital {
        uint hId;
        string hospitalName;
        string imgUrl;
        uint nRecords;
        string manager;
        string phone;
        string email;
    }
    
    struct user {
        address h_address;
        address u_address;
        uint userId;
        uint hId;
    }
    
    struct record {
        uint rId;
        address u_add;
        uint hId;
        string date;
        string expiry;
        string recordUrl;
        string r_status;
    }
    
    address owner;
    uint public hId = 0;
    uint public userId = 0;
    uint public rId = 0;
    address[] public accessers = [
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4, // airport
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4, // public hospital
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4  // public school
    ];
    
    hospital[] public hospitals;
    mapping(address => uint) public h_map;
    record[] public u_map;

    constructor() {
        owner = msg.sender;
    }
    
    function addHospital(
        string calldata _hName,
        string calldata _imgUrl,
        string calldata _manager,
        string calldata _phone,
        string calldata _email
    ) public {

       hospitals.push(
        hospital({
    hId: hId,
    hospitalName: _hName,
    imgUrl: _imgUrl,
    nRecords: 0,
    manager: _manager,
    phone: _phone,
    email: _email
   
    }));
        
        h_map[msg.sender] = hId;
        hId++;
    }
    
    function viewhospitals() public view returns (hospital[] memory) {
        return hospitals;
    }
    function addUserData(
        address u_add,  
        string calldata _date,
        string calldata _expiryDate,
        string calldata _recordUrl,
        string calldata _rstatus
    ) public  {
        require(h_map[msg.sender] < hospitals.length, "Hospital not registered");
    record memory newRecord = record(rId,u_add,h_map[msg.sender], _date, _expiryDate, _recordUrl, _rstatus);
    u_map.push(newRecord);
    rId++;
    userId++;     
    }
    
 function fetchUserProfile(address u_add) external view returns (record[] memory) {
        // Count matching records first to determine array size
        uint256 count = 0;
        for (uint256 i = 0; i < u_map.length; i++) {
            if (u_map[i].u_add == u_add && u_map[i].hId == h_map[msg.sender]) {
                count++;
            }
        }

        // Create a fixed-size memory array
        record[] memory userRecord = new record[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < u_map.length; i++) {
            if (u_map[i].u_add == u_add && u_map[i].hId == h_map[msg.sender]) {
                userRecord[index] = u_map[i];
                index++;
            }
        }

        return userRecord;
    }
}