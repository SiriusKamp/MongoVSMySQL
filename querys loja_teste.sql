CREATE DATABASE IF NOT EXISTS loja_teste;
USE loja_teste;

SET GLOBAL innodb_buffer_pool_size = 4294967296; -- 4GB em bytes

CREATE TABLE cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE produto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  preco DECIMAL(10,2)
);

CREATE TABLE venda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  produto_id INT,
  data_venda DATETIME,
  quantidade INT,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (produto_id) REFERENCES produto(id)
);

DELIMITER $$

CREATE PROCEDURE gerar_clientes()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 1000 DO
    INSERT INTO cliente (nome, email)
    VALUES (
      CONCAT('Cliente ', i),
      CONCAT('cliente', i, '@exemplo.com')
    );
    SET i = i + 1;
  END WHILE;
END $$

DELIMITER ;

CALL gerar_clientes();
DROP PROCEDURE gerar_clientes;

DELIMITER $$

CREATE PROCEDURE gerar_produtos()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 1000 DO
    INSERT INTO produto (nome, preco)
    VALUES (
      CONCAT('Produto ', i),
      ROUND(RAND() * 100 + 1, 2) -- preço aleatório entre 1 e 101
    );
    SET i = i + 1;
  END WHILE;
END $$

DELIMITER ;

CALL gerar_produtos();
DROP PROCEDURE gerar_produtos;

DELIMITER $$
-- os testes foram feitos com 3400000 registros, pois durante os testes de inserção fui vendo o tempo para inserir 10 mil e 100 mil registros
-- eles acabaram se acumulando porém não coloque 3 milhoes de registros de uma vez pois ira demorar ou travar. 
CREATE PROCEDURE gerar_vendas()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 100000 DO
    INSERT INTO venda (cliente_id, produto_id, data_venda, quantidade)
    VALUES (
      FLOOR(1 + (RAND() * 1000)), -- cliente aleatório
      FLOOR(1 + (RAND() * 1000)), -- produto aleatório
      NOW() - INTERVAL FLOOR(RAND() * 365) DAY, -- data nos últimos 365 dias
      FLOOR(1 + (RAND() * 10)) -- quantidade entre 1 e 10
    );
    SET i = i + 1;
  END WHILE;
END $$

DELIMITER ;

CALL gerar_vendas();
DROP PROCEDURE gerar_vendas;

SELECT *
FROM (
  SELECT DISTINCT
    c.nome AS nome_cliente,
    p.nome AS nome_produto,
    v.data_venda,
    v.quantidade
  FROM venda v
  INNER JOIN cliente c ON c.id = v.cliente_id
  INNER JOIN produto p ON p.id = v.produto_id
) AS query;

select * from query ;

select * from venda;

select * from produto;

select * from cliente;

SELECT DISTINCT
    c.nome AS nome_cliente,
    p.nome AS nome_produto,
    v.data_venda,
    v.quantidade
  FROM venda v
  INNER JOIN cliente c ON c.id = v.cliente_id
  INNER JOIN produto p ON p.id = v.produto_id
  where v.data_venda > '2025-02-01' and v.data_venda < '2025-03-01';

update venda set quantidade = 20;

delete from venda;
