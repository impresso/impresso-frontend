import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AudioPlayer from "./AudioPlayer.vue";

const meta: Meta<typeof AudioPlayer> = {
  title: "Components/AudioPlayer",
  component: AudioPlayer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A simple audio player component built with Vue 3.5.x Composition API that uses the HTML audio tag.",
      },
    },
  },
  argTypes: {
    src: {
      control: "text",
      description: "URL of the audio file to play",
    },
    authToken: {
      control: "text",
      description:
        "Bearer token for authorization when fetching audio chunks (enables authenticated streaming)",
    },
    autoplay: {
      control: "boolean",
      description: "Whether to start playing automatically when loaded",
    },
    loop: {
      control: "boolean",
      description: "Whether to loop the audio when it ends",
    },
    // Events
    onPlay: {
      action: "play",
      description: "Emitted when audio starts playing",
    },
    onPause: {
      action: "pause",
      description: "Emitted when audio is paused",
    },
    onEnded: {
      action: "ended",
      description: "Emitted when audio playback ends",
    },
    onError: {
      action: "error",
      description: "Emitted when an error occurs",
    },
    onTimeupdate: {
      action: "timeupdate",
      description: "Emitted when current time updates",
    },
  },
  args: {
    autoplay: false,
    loop: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample audio URL for demo purposes
const sampleAudioUrl =
  "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

export const Default: Story = {
  args: {
    src: sampleAudioUrl,
  },
};

export const WithAutoplay: Story = {
  args: {
    src: sampleAudioUrl,
    autoplay: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Audio player that starts playing automatically when loaded.",
      },
    },
  },
};

export const WithLoop: Story = {
  args: {
    src: sampleAudioUrl,
    loop: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Audio player that loops the audio when it ends.",
      },
    },
  },
};

export const NoSource: Story = {
  args: {
    src: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Audio player with no source - shows disabled state.",
      },
    },
  },
};

export const CustomAudioFile: Story = {
  args: {
    src: "",
  },
  parameters: {
    docs: {
      description: {
        story: "You can provide your own audio file URL in the src prop.",
      },
    },
  },
};

// Interactive story for testing different audio formats
export const Playground: Story = {
  args: {
    src: sampleAudioUrl,
    autoplay: false,
    loop: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive playground to test different audio player configurations.",
      },
    },
  },
};
