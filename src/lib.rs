#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address};

const COUNTER: Symbol = symbol_short!("COUNTER");
const BALANCES: Symbol = symbol_short!("BALANCES");
const TOTAL_SUPPLY: Symbol = symbol_short!("SUPPLY");

#[contract]
pub struct ContadorContract;

#[contractimpl]
impl ContadorContract {
    // ===== FUNCIONES DE CONTADOR =====
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        count
    }

    pub fn decrement(env: Env) -> u32 {
        let count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        let new_count = count.saturating_sub(1);
        env.storage().instance().set(&COUNTER, &new_count);
        new_count
    }

    pub fn get(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }

    pub fn reset(env: Env) {
        env.storage().instance().set(&COUNTER, &0u32);
    }

    // ===== FUNCIONES DE TOKEN =====
    /// Mint: Crear nuevos tokens para una cuenta
    pub fn mint(env: Env, to: Address, amount: u128) -> u128 {
        let mut balances: soroban_sdk::Map<Address, u128> = env
            .storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or_else(|| soroban_sdk::Map::new(&env));

        let current_balance: u128 = balances.get(to.clone()).unwrap_or(0);
        let new_balance = current_balance.checked_add(amount).expect("overflow");

        balances.set(to, new_balance.clone());
        env.storage().instance().set(&BALANCES, &balances);

        // Actualizar supply total
        let mut total_supply: u128 = env
            .storage()
            .instance()
            .get(&TOTAL_SUPPLY)
            .unwrap_or(0);
        total_supply = total_supply.checked_add(amount).expect("overflow");
        env.storage().instance().set(&TOTAL_SUPPLY, &total_supply);

        new_balance
    }

    /// Transfer: Transferir tokens de un cuenta a otra
    pub fn transfer(env: Env, from: Address, to: Address, amount: u128) -> bool {
        let mut balances: soroban_sdk::Map<Address, u128> = env
            .storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or_else(|| soroban_sdk::Map::new(&env));

        let from_balance: u128 = balances.get(from.clone()).unwrap_or(0);

        // Verificar que hay suficientes fondos
        if from_balance < amount {
            return false;
        }

        // Restar de origen
        let new_from_balance = from_balance - amount;
        balances.set(from, new_from_balance);

        // Sumar a destino
        let to_balance: u128 = balances.get(to.clone()).unwrap_or(0);
        let new_to_balance = to_balance.checked_add(amount).expect("overflow");
        balances.set(to, new_to_balance);

        env.storage().instance().set(&BALANCES, &balances);
        true
    }

    /// Balance: Obtener el saldo de una cuenta
    pub fn balance(env: Env, account: Address) -> u128 {
        let balances: soroban_sdk::Map<Address, u128> = env
            .storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or_else(|| soroban_sdk::Map::new(&env));

        balances.get(account).unwrap_or(0)
    }

    /// Total Supply: Obtener el suministro total de tokens
    pub fn total_supply(env: Env) -> u128 {
        env.storage().instance().get(&TOTAL_SUPPLY).unwrap_or(0)
    }

    /// Burn: Quemar (destruir) tokens de una cuenta
    pub fn burn(env: Env, from: Address, amount: u128) -> bool {
        let mut balances: soroban_sdk::Map<Address, u128> = env
            .storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or_else(|| soroban_sdk::Map::new(&env));

        let from_balance: u128 = balances.get(from.clone()).unwrap_or(0);

        // Verificar que hay suficientes fondos
        if from_balance < amount {
            return false;
        }

        let new_balance = from_balance - amount;
        balances.set(from, new_balance);
        env.storage().instance().set(&BALANCES, &balances);

        // Actualizar supply total
        let mut total_supply: u128 = env
            .storage()
            .instance()
            .get(&TOTAL_SUPPLY)
            .unwrap_or(0);
        total_supply = total_supply.saturating_sub(amount);
        env.storage().instance().set(&TOTAL_SUPPLY, &total_supply);

        true
    }
}

// Contrato ficticio para generar direcciones de prueba
#[contract]
pub struct DummyContract;

#[contractimpl]
impl DummyContract {
    pub fn dummy(_env: Env) {}
}

// AQUÍ EMPIEZAN TUS TESTS
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_increment() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        assert_eq!(client.increment(), 1);
    }

    #[test]
    fn test_decrement() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        client.increment();
        assert_eq!(client.decrement(), 0);
    }

    #[test]
    fn test_reset() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        client.increment();
        client.reset();
        assert_eq!(client.get(), 0);
    }

    // ===== TESTS DE TOKEN =====
    #[test]
    fn test_mint() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        // Crear dirección de prueba
        let account = env.register(DummyContract, ());
        
        let balance = client.mint(&account, &1000u128);
        
        assert_eq!(balance, 1000u128);
        assert_eq!(client.balance(&account), 1000u128);
        assert_eq!(client.total_supply(), 1000u128);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let account1 = env.register(DummyContract, ());
        let account2 = env.register(DummyContract, ());
        
        // Mint tokens a account1
        client.mint(&account1, &1000u128);
        
        // Transferir 300 a account2
        let success = client.transfer(&account1, &account2, &300u128);
        
        assert_eq!(success, true);
        assert_eq!(client.balance(&account1), 700u128);
        assert_eq!(client.balance(&account2), 300u128);
        assert_eq!(client.total_supply(), 1000u128);
    }

    #[test]
    fn test_transfer_insufficient_funds() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let account1 = env.register(DummyContract, ());
        let account2 = env.register(DummyContract, ());
        
        // Mint tokens a account1
        client.mint(&account1, &100u128);
        
        // Intentar transferir más de lo que tiene
        let success = client.transfer(&account1, &account2, &500u128);
        
        assert_eq!(success, false);
        assert_eq!(client.balance(&account1), 100u128);
        assert_eq!(client.balance(&account2), 0u128);
    }

    #[test]
    fn test_balance() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let account = env.register(DummyContract, ());
        
        // Balance inicial debe ser 0
        assert_eq!(client.balance(&account), 0u128);
        
        // Después de mint
        client.mint(&account, &500u128);
        assert_eq!(client.balance(&account), 500u128);
    }

    #[test]
    fn test_burn() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let account = env.register(DummyContract, ());
        
        // Mint tokens
        client.mint(&account, &1000u128);
        assert_eq!(client.total_supply(), 1000u128);
        
        // Quemar 300 tokens
        let success = client.burn(&account, &300u128);
        
        assert_eq!(success, true);
        assert_eq!(client.balance(&account), 700u128);
        assert_eq!(client.total_supply(), 700u128);
    }

    #[test]
    fn test_burn_insufficient_funds() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let account = env.register(DummyContract, ());
        
        // Mint tokens
        client.mint(&account, &100u128);
        
        // Intentar quemar más de lo que tiene
        let success = client.burn(&account, &500u128);
        
        assert_eq!(success, false);
        assert_eq!(client.balance(&account), 100u128);
        assert_eq!(client.total_supply(), 100u128);
    }

    #[test]
    fn test_multiple_operations() {
        let env = Env::default();
        let contract_id = env.register(ContadorContract, ());
        let client = ContadorContractClient::new(&env, &contract_id);
        
        let acc1 = env.register(DummyContract, ());
        let acc2 = env.register(DummyContract, ());
        let acc3 = env.register(DummyContract, ());
        
        // Mint a múltiples cuentas
        client.mint(&acc1, &1000u128);
        client.mint(&acc2, &500u128);
        assert_eq!(client.total_supply(), 1500u128);
        
        // Transferencias
        client.transfer(&acc1, &acc3, &200u128);
        client.transfer(&acc2, &acc1, &100u128);
        
        // Verificar balances
        assert_eq!(client.balance(&acc1), 900u128);
        assert_eq!(client.balance(&acc2), 400u128);
        assert_eq!(client.balance(&acc3), 200u128);
        
        // Quemar
        client.burn(&acc1, &100u128);
        assert_eq!(client.total_supply(), 1400u128);
        assert_eq!(client.balance(&acc1), 800u128);
    }
}
