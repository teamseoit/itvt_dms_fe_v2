import dashboard from './dashboard';
import account from './account';
import customer from './customer';
import supplier from './supplier';
import itvt from './itvt';
import service from './service';
import contract from './contract';
import storage from './storage';
import ipWhitelist from './ipWhitelist';

const menuItems = {
  items: [dashboard, ipWhitelist, account, customer, supplier, service, itvt, contract, storage]
};

export default menuItems;
