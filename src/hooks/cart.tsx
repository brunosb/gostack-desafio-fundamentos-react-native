import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // LOAD ITEMS FROM ASYNC STORAGE

      const items = await AsyncStorage.getItem('@GoMarketplace:items');
      if (items !== null) {
        const convertJsonToProducts = JSON.parse(items);
        console.log(convertJsonToProducts);
        setProducts([...convertJsonToProducts]);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:items',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // ADD A NEW ITEM TO THE CART
      const { id, title, image_url, price } = product;

      const indexProduct = products.findIndex(p => p.id === id);

      if (indexProduct !== -1) {
        products[indexProduct].quantity += 1;
        setProducts([...products]);
      } else {
        setProducts([
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // INCREMENTS A PRODUCT QUANTITY IN THE CART

      const indexProduct = products.findIndex(product => product.id === id);
      products[indexProduct].quantity += 1;
      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // DECREMENTS A PRODUCT QUANTITY IN THE CART

      const indexProduct = products.findIndex(product => product.id === id);
      const { quantity } = products[indexProduct];

      if (quantity === 1) {
        products.splice(indexProduct, 1);
      } else {
        products[indexProduct].quantity -= 1;
      }

      setProducts([...products]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
