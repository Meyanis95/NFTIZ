import * as React from 'react';
import {useState} from 'react';
import '../styles/ui.css';

const Loader = ({}) => {
  // This is how we read messages sent from the plugin controller
  const [ipfsUrl, SetIpfsUrl] = useState('');
  const [externalUrl, SetExternalUrl] = useState('');
  const [isLoading, SetIsLoading] = useState(true);
  const [isError, SetIsError] = useState(false);
  const [errorType, SetErrorType] = useState('');
  const [txHash, setTxHash] = useState('');
  const [oSLink, setOSLink] = useState('https://opensea.io/');

  function Spinner() {
    return (
      <div id="spinnerHolder">
        <div id="spinner"></div>
        <h2>Minting ...</h2>
      </div>
    )
  }

  window.onmessage = (event) => {
    const {type, bytes, name, desc, address} = event.data.pluginMessage;

    if (type === 'run') {
      async function main() {
        var url = 'https://api.nft.storage/upload';
        var data = new Blob([bytes], {type: 'image/png'});
  
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: process.env.NFT_STORAGE_KEY,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data,
        }).then((response) => {
            return response.json().then(function (json) {
                console.log('IPFS url: ', 'https://ipfs.io/ipfs/' + json.value.cid.toString());
                SetIpfsUrl('https://ipfs.io/ipfs/' + json.value.cid.toString());
                return 'https://ipfs.io/ipfs/' + json.value.cid.toString();
            })
          .catch(error => {
            throw(error)
          })
        });
        return result;
      }
      
      async function upload_meta(name, desc, ipfs_url) {
        var url = 'https://api.nftport.xyz/v0/metadata';
        const data_up = JSON.stringify({
            chain: 'rinkeby',
            name: name,
            description: desc,
            file_url: ipfs_url,
        });

        const result_up = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: process.env.NFTPORT_KEY,
                'Content-Type': 'application/json',
            },
            body: data_up,
        }).then((response) => {
            return response.json().then(function (json) {
                console.log('Metadata URL:',json.metadata_uri);
                return json.metadata_uri;
            });
        });
        return result_up;
      }

      function mint_with_meta(metadata, address) {
        const data = JSON.stringify({
            chain: 'rinkeby',
            contract_address: '0xE5901EC65DC830e54b98Ff6097afA70eD2Ab4169',
            metadata_uri: metadata,
            mint_to_address: address,
        });

        fetch('https://api.nftport.xyz/v0/mints/customizable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.NFTPORT_KEY,
            },
            body: data,
        })
            .then((response) => {
                return response.json().then(function (json) {
                    if (json.response ===  'OK') {
                        console.log('NFT minted!')
                        SetIsLoading(false)
                        console.log('Status:', json.response);
                        console.log('Transaction hash:', json.transaction_hash);
                        setTxHash(json.transaction_hash);
                        console.log('Transaction url:', json.transaction_external_url);
                        SetExternalUrl(json.transaction_external_url);
                        console.log(response);
                    }
                    else if (json.response === 'NOK') {
                      SetIsLoading(false)
                      SetIsError(true)
                      SetErrorType(json.error)
                    }
                });
            })
            .catch((err) => {
                throw(err);
            });
      }

      function fetch_id() {
        fetch("https://api.nftport.xyz/v0/mints/"+txHash+"?chain=polygon", {
          "method": "GET",
          "headers": {
            "Content-Type": "application/json",
            Authorization: process.env.NFTPORT_KEY,
          }
        })
        .then(response => {
          return response.json().then(function (json) {
            console.log(json.response);
            return "https://opensea.io/assets/"+json.response.contract_address+"/"+json.response.token_id;
          })

        })
        .catch(err => {
          console.error(err);
        });
      }

      async function run() {
        const ipfs_url = await main();
        const meta_url = await upload_meta(name, desc, ipfs_url);
        mint_with_meta(meta_url, address);
        const os_url = fetch_id();
        console.log('OpenSea URL: ', os_url);
      }
    run();
    }
  }

  function RenderSuccess() {
    return (
      <div>
      <h3 className="v2_26">NFT MINTED ✅</h3>
      <ul className="fullclick">
        <li>
          <form target="_blank">
          <button id="result_ipfs" formAction={ipfsUrl}>💾 See your image stored on IPFS</button>
          </form>
        </li>
        <li>
          <form target="_blank">
          <button id="result_etherscan" formAction={externalUrl}>📊 See your transaction on etherscan</button>
          </form>
        </li>
        <li>
          <form target="_blank">
          <button id="result_os" formAction={oSLink}>⛴ See your NFT on Opensea</button>
          </form>
        </li>
      </ul>
      </div>
    )
  }

  function RenderError() {
    return (
      <div>
        <div>
            <h3 className="v2_26">Oups it seems that it's not working... </h3>
        </div>
        <div>
          <span id="result_error" >Error: {errorType}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <div className="v2_25"></div>
      </div>
      {isLoading ? <Spinner /> : 
      [(isError ? <RenderError /> : <RenderSuccess />)]
      }
    </div>
  )
}

export default Loader;