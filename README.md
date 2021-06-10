# USDZ 稳定币

USDZ 稳定币从 USDT 衍生而来，合约也是基于 USDT 在 ETH 上的合约源码修改而来。主要修改如下：

1. 在 `Owner` 的基础上，增加一个 `Issuer` 角色；
2. `decimal` 小数设置为 2；

## 介绍
### 私钥分配
| 私钥编号  | 角色  |  说明 |
|---|---|---|
| Deploy  | 部署时的私钥  | 部署时，设置总发行量为 `0` <br />部署后，调用方法转移角色  |
| Owner | 合约的拥有者  |  控制合约暂停，恢复交易 |
| Issuer  | 代币发行方  |  控制代币的总量  |
| Cold  | 交易所冷钱包  | 交易所大部分资产的持有方 |
| Hot  |  交易所热钱包 | 主私钥，用户地址使用 `BIP39` 协议生成  |

### 业务流程
1. 使用 `Deploy` 私钥部署合约，设置总发行量为 `0`；

2. 使用 `Deploy` 私钥设置 `Owner` 和 `Issuer` 的角色地址；
3. 使用 `Issuer` 私钥发行代币（设置总量）；
4. 使用 `Issuer` 私钥在发行（增发）代币后，账户指定数量的代币到 `Cold` 地址；
5. 使用 `Cold` 私钥按照一定的比例分别，账户一定数量的代币到 `Hot` 地址；
6. 一旦发现风险（洗钱），使用 `Owner` 私钥暂停合约交易，后续可以恢复合约交易；
7. 使用 `Cold` 私钥可以账户代币到 `Issuer` 进行赎回操作，后续 `Issuer` 可以执行销毁操作；

>**提示：**
>
> * `Deploy` 只参与合约**部署**和**角色转移**；
> * 部署时，设置代币发行总量为 `0`；
> * 在合约完成部署后，转移 `Owner` 和 `Issuer` 的控制权到相应的地址；


## 安装
部署时需要本地安装好 `Node.js` 环境，[点击安装 Node.js](https://nodejs.org/en/download/package-manager/)。

* 安装依赖库后，运行测试命令

```Bash
# 安装依赖库
» npm install

```

## 测试

已完成测试用例：
* 部署
    * 部署时，默认发行量为 `0`
    
    * 部署后，默认的 `Owner` 和 `Issuer` 都是 `Deployer`
    * `Deployer` 转移 `Owner` 和 `Issuer` 权限到别的地址
    * `Deployer` 转移权限后，不能再屌用转移权限的方法
* 发行（增发）代币
    * 部署后，代码总发行量为 `0`
    * `Deployer` 不能发行（增发）代币
    * 发行（增发）代币，转账到 `Cold` 账户
* 销毁
    * `Cold` 转账到 `Issuer` 账户
    * `Issuer` 销毁
* 转账
    * `Cold` 冷钱包转账到 `Hot` 热钱包
    * `Hot` 热钱包提包到用户账号
    * 用户之间相互转账
    * 用户代币不足，转账失败
    * 归集，将用户的余额转账到 `Hot` 热钱包
* 暂停
    * 只有 `Owner` 角色可以调用 `paused` 方法
    * 调用 `paused` 方法后，不能再进行交易
    * 只有 `Owner` 角色可以调用 `unpause` 方法
     
```Bash
# 测试命令
» npx hardhat test

  Token contract
        ZA token address:  0xdF42BDD71e91aB1C5282d4652A13d2034F239735
        -------------------------------------
        deployer:  0x1A791AE70A9AA6672bDa65f98BfB1d2f0f60cbfA
        owner:  0xE0D481beD5A93Cc51196d49B9bEBD4e8C1cc7564
        issuer:  0x32E440fD6A1843eebEE04fb7ed1225332A619624
        -------------------------------------
        cold:  0x6614248ae2f5215ef2A439bE26347F2E2401d38a
        hot:  0xdf083353CF69623Dc832033517538946377d28da
        -------------------------------------
        user1:  0x47708D1a69d2c8E0E2A2992482DF6441E88AE0D8
        user2:  0x4d13CB1c38FB59e691c00e3CB50f36AFc7Cf57F8
        user3:  0x3552B886E6FD069dFB57e3bcad806f7b174c7809


    Deployment
      ✓ Default owner and issuer is the [deployer]
      ✓ Each balance is 0 (52ms)
      ✓ Change owner and issuer to another (112ms)
      ✓ Deployer call function failed after transferring role to another (42ms)
    Issue tokens after contract deployed
      ✓ Total supply should be zero
      ✓ Deployer issue failed
      ✓ Issue and send to cold account (172ms)
    Redeem tokens
      ✓ Transfer tokens from cold to issuer (56ms)
      ✓ Redeem (79ms)
    Transactions
      ✓ Transfer from cold to hot (61ms)
      ✓ Transfer from hot to user (105ms)
      ✓ Transfer between users: from user3 to user1 (49ms)
      ✓ Should fail if sender doesn't have enough tokens
      ✓ Collect from users to hot (234ms)
    Pause test
      ✓ Only owner can call paused function (43ms)
      ✓ Transfer failed when contract is paused
      ✓ Only owner can call unpause function (48ms)


  17 passing (2s)
```
