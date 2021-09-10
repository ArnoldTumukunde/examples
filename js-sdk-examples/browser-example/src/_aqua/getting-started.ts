/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/. 
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.3.0-226
 *
 */
import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import {
    ResultCodes,
    RequestFlow,
    RequestFlowBuilder,
    CallParams,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v1';


// Services


// Functions

 export function getRelayTime(relayPeerId: string, config?: {ttl?: number}) : Promise<number>;
 export function getRelayTime(peer: FluencePeer, relayPeerId: string, config?: {ttl?: number}) : Promise<number>;
 export function getRelayTime(...args: any) {
     let peer: FluencePeer;
     let relayPeerId: any;
     let config: any;
     if (FluencePeer.isInstance(args[0])) {
         peer = args[0];
         relayPeerId = args[1];
config = args[2];
     } else {
         peer = Fluence.getPeer();
         relayPeerId = args[0];
config = args[1];
     }
    
     let request: RequestFlow;
     const promise = new Promise<number>((resolve, reject) => {
         const r = new RequestFlowBuilder()
                 .disableInjections()
                 .withRawScript(
                     `
     (xor
 (seq
  (seq
   (seq
    (seq
     (seq
      (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
      (call %init_peer_id% ("getDataSrv" "relayPeerId") [] relayPeerId)
     )
     (call -relay- ("op" "noop") [])
    )
    (xor
     (call relayPeerId ("peer" "timestamp_ms") [] ts)
     (seq
      (call -relay- ("op" "noop") [])
      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
     )
    )
   )
   (call -relay- ("op" "noop") [])
  )
  (xor
   (call %init_peer_id% ("callbackSrv" "response") [ts])
   (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
)

                 `,
                 )
                 .configHandler((h) => {
                     h.on('getDataSrv', '-relay-', () => {
                    return peer.getStatus().relayPeerId;
                });
                h.on('getDataSrv', 'relayPeerId', () => {return relayPeerId;});
                h.onEvent('callbackSrv', 'response', (args) => {
    const [res] = args;
  resolve(res);
});

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for getRelayTime');
            })
        if(config && config.ttl) {
            r.withTTL(config.ttl)
        }
        request = r.build();
    });
    peer.internals.initiateFlow(request!);
    return promise;
}
      
