module ForemanAiTemplates
  class Engine < ::Rails::Engine
    engine_name 'foreman_ai_templates'

    # Add any db migrations
    initializer 'foreman_ai_templates.load_app_instance_data' do |app|
      ForemanAiTemplates::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end
    end

    initializer 'foreman_ai_templates.register_plugin', :before => :finisher_hook do |app|
      app.reloader.to_prepare do
        Foreman::Plugin.register :foreman_ai_templates do
          requires_foreman '>= 3.15.0'
          register_gettext

          # Add Global files for extending foreman-core components and routes
          register_global_js_file 'global'

          # Add permissions
          security_block :foreman_ai_templates do
            permission :create_ai_templates, { :'api/v2/ai_templates' => [:create] }
          end

          role 'AI Templates User', [:create_ai_templates]

          menu :top_menu, :ai_templates,
            caption: N_('AI Templates'),
            url: 'ai_templates',
            parent: :hosts_menu,
            after: :job_templates
        end
      end
    end

    # Include concerns in this config.to_prepare block
    config.to_prepare do
      # TODO
    rescue StandardError => e
      Rails.logger.warn "ForemanAiTemplates: skipping engine hook (#{e})"
    end

    rake_tasks do
      Rake::Task['db:seed'].enhance do
        ForemanAiTemplates::Engine.load_seed
      end
    end
  end
end
