// composables/useTTS.ts
import { ref } from 'vue';

export function useTTS() {
  // 每个组件独立管理自己的音频实例，互不干扰
  const currentAudio = ref<HTMLAudioElement | null>(null);
  /**
   * 主发音函数
   * @param text 要朗读的文本
   * @param voice 可选，指定语音名称，默认 'en-US-JennyNeural'
   * @param rate 语速，默认 0 (正常)
   * @param pitch 音调，默认 0 (正常)
   */
  async function speak(
    text: string,
    // voice: string = 'en-US-JennyNeural',
    // rate: string = '+0%',
    // pitch: string = '+0Hz'
  ) {

    if (!text) return;

    // 停止当前播放
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value = null;
    }

    fallbackSpeak(text);

    // try {
    //   // 1. 调用 FreeTTS API 获取 file_id
    //   console.info("调用 FreeTTS API")
    //   const ttsResponse = await fetch('https://freetts.org/api/tts', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: text.trim(),
    //       voice,
    //       rate,
    //       pitch,
    //     }),
    //   });

    //   if (!ttsResponse.ok) {
    //     throw new Error(`TTS API 错误: ${ttsResponse.status}`);
    //   }

    //   const { file_id } = await ttsResponse.json();
    //   if (!file_id) throw new Error('未获取到音频 ID');

    //   // 2. 下载音频
    //   const audioResponse = await fetch(`https://freetts.org/api/audio/${file_id}`);
    //   if (!audioResponse.ok) throw new Error('音频下载失败');

    //   const audioBlob = await audioResponse.blob();
    //   const audioUrl = URL.createObjectURL(audioBlob);

    //   // 3. 播放
    //   const audio = new Audio(audioUrl);
    //   currentAudio.value = audio;

    //   audio.onended = () => {
    //     URL.revokeObjectURL(audioUrl);
    //     if (currentAudio.value === audio) currentAudio.value = null;
    //   };
    //   audio.onerror = () => {
    //     URL.revokeObjectURL(audioUrl);
    //     if (currentAudio.value === audio) currentAudio.value = null;
    //   };
    //   console.info('FreeTTS 播放成功:');
    //   await audio.play();
    // } catch (error) {
    //   console.error('FreeTTS 播放失败，降级到 Web Speech API:', error);
    //   // 降级方案：使用浏览器内置 TTS
    //   fallbackSpeak(text);
    // }
  }

  /**
   * 降级方案：使用 Web Speech API
   */
  function fallbackSpeak(text: string) {
    if (!window.speechSynthesis) {
      console.warn('浏览器不支持语音合成');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // 延迟一点再读，防止 cancel 和 speak 冲突
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.5;   // 稍微慢一点，更清晰
      utterance.pitch = 1.2;

      // 🔥 关键：从系统所有语音中挑选最自然的那个
      const voices = window.speechSynthesis.getVoices();
      // 优先级：Google 美音 > 系统美音 > 任何英文语音
      const selectedVoice =
        voices.find(v => v.lang === 'en-US' && v.name.includes('Zira')) ||  // Windows 备选
        voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha')) ||  // Mac 专属
        voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'en-US') ||                                 // 任意美音
        voices.find(v => v.lang.startsWith('en'));                              // 任意英文

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        // console.log('当前使用语音:', selectedVoice.name);
      } else {
        // console.warn('未找到合适的英文语音，使用默认语音');
      }

      window.speechSynthesis.speak(utterance);
    }, 50);

  }




  return { speak };
}