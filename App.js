import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única para salvar nossos dados no celular
const STORAGE_KEY = '@acai_control_products';

export default function App() {
  // --- Estados (a memória do nosso app) ---
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');

  // --- Funções para Carregar e Salvar os Dados ---

  // Função para carregar os produtos salvos na memória do celular
  const loadProducts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setProducts(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Erro ao carregar produtos', e);
    }
  };

  // Função para salvar os produtos na memória do celular
  const saveProducts = async (newProducts) => {
    try {
      const jsonValue = JSON.stringify(newProducts);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Erro ao salvar produtos', e);
    }
  };

  // useEffect: Roda uma única vez quando o app abre para carregar os dados
  useEffect(() => {
    loadProducts();
  }, []);

  // --- Funções de Ação (o que os botões fazem) ---

  const handleAddProduct = () => {
    if (!newProductName || !newProductPrice || !newProductStock) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    const newProduct = {
      id: String(new Date().getTime()), // ID único baseado no tempo
      name: newProductName,
      price: parseFloat(newProductPrice),
      stock: parseInt(newProductStock),
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProducts(updatedProducts); // Salva a lista atualizada

    // Limpa os campos de texto
    setNewProductName('');
    setNewProductPrice('');
    setNewProductStock('');
  };

  const handleSellProduct = (productId) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.stock > 0) {
        return { ...product, stock: product.stock - 1 };
      }
      return product;
    });
    setProducts(updatedProducts);
    saveProducts(updatedProducts); // Salva a lista atualizada
  };

  const handleRestockProduct = (productId) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        // Adiciona 10 ao estoque como exemplo
        return { ...product, stock: product.stock + 10 };
      }
      return product;
    });
    setProducts(updatedProducts);
    saveProducts(updatedProducts); // Salva a lista atualizada
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => {
            const updatedProducts = products.filter(product => product.id !== productId);
            setProducts(updatedProducts);
            saveProducts(updatedProducts);
          },
          style: 'destructive'
        }
      ]
    );
  };


  // --- Renderização (o que aparece na tela) ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Açaí Control</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do Produto (Ex: Açaí 500ml)"
          value={newProductName}
          onChangeText={setNewProductName}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço (Ex: 15.50)"
          value={newProductPrice}
          onChangeText={setNewProductPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Estoque Inicial (Ex: 50)"
          value={newProductStock}
          onChangeText={setNewProductStock}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Cadastrar Produto</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDetails}>
                Preço: R$ {item.price.toFixed(2)} | Estoque: {item.stock}
              </Text>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.sellButton}
                onPress={() => handleSellProduct(item.id)}>
                <Text style={styles.buttonText}>Vender</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restockButton}
                onPress={() => handleRestockProduct(item.id)}>
                <Text style={styles.buttonText}>Repor</Text>
              </TouchableOpacity>
               <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(item.id)}>
                <Text style={styles.buttonText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- Estilos (a aparência do nosso app) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f7',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#3d3d4d',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'column',
    elevation: 2, // Sombra para Android
  },
  productInfo: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sellButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  restockButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
    deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
});