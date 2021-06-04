# USDZ 稳定币

USDZ 稳定币从 USDT 衍生而来，合约也是基于 USDT 在 ETH 上的合约源码修改而来。主要修改如下：

1. 在 `Owner` 的基础上，增加一个 `Issuer` 角色；
2. `decimal` 小数设置为 2；
3. `transfer` 方法增加了一个 `txIndex` 变量，防止监听事件遗漏；
4. 去掉了所有跟 `fee` 相关逻辑；

## 部署
部署时需要本地安装好 `Node.js` 环境，[点击此处跳转](https://nodejs.org/en/download/package-manager/)。


```Bash
# 安装依赖库
npm install
 
# 运行测试代码
npx hardhat test
```

