import{Capacitor,CapacitorHttp}from'@capacitor/core';
import{App}from'@capacitor/app';
import{createNativeFetch}from'./transport.js';
const publicUrl=FUSION_PUBLIC_URL;
window.FusionNative={publicUrl,isNative:Capacitor.isNativePlatform(),version:FUSION_APP_VERSION};
if(Capacitor.isNativePlatform()){
 const transport=createNativeFetch({request:options=>CapacitorHttp.request(options),fallback:window.fetch.bind(window),apiOrigin:publicUrl,localOrigin:location.href});
 window.fetch=transport.fetch;
 App.addListener('appStateChange',({isActive})=>{window.FusionUI?.nativeVisibility?.(!isActive);if(isActive)window.dispatchEvent(new Event('online'));else{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('pagehide'));}});
}
