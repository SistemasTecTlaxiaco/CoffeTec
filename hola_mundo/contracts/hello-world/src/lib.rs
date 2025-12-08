#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, String, Symbol, Vec,
};

// ------------------------------------------------------------
// HELLO WORLD (original example)
// ------------------------------------------------------------
#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}

mod test;

// ------------------------------------------------------------
// CAFE CONTRACT
// ------------------------------------------------------------

#[contracttype]
#[derive(Clone)]
pub struct Order {
    pub customer: Address,
    pub product: Symbol,
    pub price: i128,
    pub paid: bool,
}

#[contract]
pub struct CafeContract;

#[contractimpl]
impl CafeContract {
    pub fn init(env: Env) {
        let orders: Vec<Order> = Vec::new(&env);
        env.storage()
            .instance()
            .set(&symbol_short!("orders"), &orders);
    }

    pub fn add_order(env: Env, customer: Address, product: Symbol, price: i128) {
        customer.require_auth();

        let mut orders: Vec<Order> = env
            .storage()
            .instance()
            .get(&symbol_short!("orders"))
            .unwrap();

        let order = Order {
            customer: customer.clone(),
            product,
            price,
            paid: false,
        };

        orders.push_back(order);
        env.storage()
            .instance()
            .set(&symbol_short!("orders"), &orders);
    }

    pub fn mark_paid(env: Env, index: u32, caller: Address) {
        caller.require_auth();

        let mut orders: Vec<Order> = env
            .storage()
            .instance()
            .get(&symbol_short!("orders"))
            .unwrap();

        let mut order = orders.get(index).unwrap();
        if order.customer != caller {
            panic!("Only the customer can confirm payment");
        }

        order.paid = true;
        orders.set(index, order);
        env.storage()
            .instance()
            .set(&symbol_short!("orders"), &orders);
    }

    pub fn list_orders(env: Env) -> Vec<Order> {
        env.storage()
            .instance()
            .get(&symbol_short!("orders"))
            .unwrap()
    }
}