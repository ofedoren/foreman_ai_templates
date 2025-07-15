require "openai"

module Api
  module V2
    class AiTemplatesController < V2::BaseController
      include Api::Version2

      def create
        output = ""
        client = OpenAI::Client.new(
          access_token: "TOKEN",
          uri_base: "https://openrouter.ai/api/v1"
        )
        prompt = <<-PROMPT
  You are generating an ERB template for a Ruby on Rails application.

  Only use the following DSL functions described in the JSON formatted documentation:
  #{ApipieDSL.docs[:docs][:classes].select { |k,v| ApipieDslHelper.in_section?('webhooks',k) }.to_json}

  - Do not use any Ruby native methods unless absolutely necessary.
  - Use ERB syntax properly (<%= %>). For more information, refer to the provided documentation.
  - If you need a function that is missing, add a comment like '# TODO: missing function'.
  - Answer only with the ERB template, nothing else.

  Now, generate an ERB template for the following task:
  ""
PROMPT

        client.chat(
          parameters: {
            model: "deepseek/deepseek-chat-v3-0324:free", # Required.
            messages: [{ role: "user", content: prompt }], # Required.
            temperature: 0.7,
            stream: proc do |chunk, _bytesize|
              output += chunk.dig("choices", 0, "message", "content")
            end
          }
        )
        render json: { output: output }
      end
    end
  end
end
