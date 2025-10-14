// NFT 图片和元数据上传到 Pinata IPFS 的脚本
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 替换为您的 Pinata API 密钥
const PINATA_API_KEY = '68f702713635629b246f';
const PINATA_SECRET_API_KEY = '9df25f55c82abc20de92aa253030826ce3d68cb47c7f2fad346a59acb1a8e78d';

// Valentine NFT 图片列表
const valentineImages = [
    'irys.png',
    
];

// 上传单个文件到 Pinata
async function uploadToPinata(filePath, fileName) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath));
    
    const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
            type: 'valentine-nft-image'
        }
    });
    data.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', options);
    
    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });
        
        console.log(`✅ ${fileName} 上传成功:`);
        console.log(`   IPFS Hash: ${response.data.IpfsHash}`);
        console.log(`   IPFS URL: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
        
        return response.data.IpfsHash;
    } catch (error) {
        console.error(`❌ ${fileName} 上传失败:`, error.response?.data || error.message);
        return null;
    }
}

// 创建 NFT 元数据
function createMetadata(imageName, ipfsHash, tokenId) {
    const baseName = path.basename(imageName, '.png');
    const displayName = baseName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return {
        name: `Valentine ${displayName} #${tokenId}`,
        description: `A beautiful 3D Valentine's Day themed NFT featuring ${displayName.toLowerCase()}. Part of the exclusive Valentine Collection.`,
        image: `ipfs://${ipfsHash}`,
        external_url: "https://your-website.com",
        attributes: [
            {
                trait_type: "Category",
                value: "Valentine"
            },
            {
                trait_type: "Style", 
                value: "3D"
            },
            {
                trait_type: "Theme",
                value: displayName
            },
            {
                trait_type: "Rarity",
                value: "Common"
            }
        ]
    };
}

// 上传元数据到 Pinata
async function uploadMetadata(metadata, tokenId) {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const data = {
        pinataContent: metadata,
        pinataMetadata: {
            name: `valentine-nft-metadata-${tokenId}.json`,
            keyvalues: {
                type: 'valentine-nft-metadata'
            }
        }
    };
    
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });
        
        console.log(`✅ 元数据 #${tokenId} 上传成功:`);
        console.log(`   IPFS Hash: ${response.data.IpfsHash}`);
        console.log(`   Metadata URL: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
        
        return response.data.IpfsHash;
    } catch (error) {
        console.error(`❌ 元数据 #${tokenId} 上传失败:`, error.response?.data || error.message);
        return null;
    }
}

// 主函数
async function main() {
    console.log('🚀 开始上传 Valentine NFT 图片和元数据到 IPFS...\n');
    
    const results = [];
    
    for (let i = 0; i < valentineImages.length; i++) {
        const imageName = valentineImages[i];
        const imagePath = path.join(__dirname, 'images', '3d', imageName);
        const tokenId = i + 1;
        
        console.log(`📸 处理图片 ${tokenId}/${valentineImages.length}: ${imageName}`);
        
        // 检查文件是否存在
        if (!fs.existsSync(imagePath)) {
            console.error(`❌ 文件不存在: ${imagePath}`);
            continue;
        }
        
        // 上传图片
        const imageHash = await uploadToPinata(imagePath, imageName);
        if (!imageHash) continue;
        
        // 创建元数据
        const metadata = createMetadata(imageName, imageHash, tokenId);
        
        // 上传元数据
        const metadataHash = await uploadMetadata(metadata, tokenId);
        if (!metadataHash) continue;
        
        results.push({
            tokenId,
            imageName,
            imageHash,
            metadataHash,
            imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
            metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`
        });
        
        console.log('---\n');
        
        // 添加延迟避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 保存结果到文件
    fs.writeFileSync('nft-upload-results.json', JSON.stringify(results, null, 2));
    
    console.log('✅ 所有文件上传完成！');
    console.log(`📄 结果已保存到: nft-upload-results.json`);
    console.log(`🎯 总共处理了 ${results.length} 个 NFT\n`);
    
    // 显示摘要
    console.log('📋 上传摘要:');
    results.forEach(result => {
        console.log(`Token #${result.tokenId}: ${result.imageName}`);
        console.log(`  图片: ${result.imageUrl}`);
        console.log(`  元数据: ${result.metadataUrl}`);
    });
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { uploadToPinata, uploadMetadata, createMetadata };



