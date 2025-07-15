# RFC: Wrapper plugin for AI in Foreman

## TL;DR: Do we want to introduce some basic AI capabilities in Foreman?

## Preface

Like almost everyone these days, I also got trapped in AI fever and wanted to play with it a bit. Suddenly I came with an
idea of how we could use some LLMs to help us, users, a bit. This RFC is rather a question if we even want to introduce
AI capabilities in Foreman and at what level. As an example I'm going to describe how I personally see it and as a proof
of concept I'd like to write a plugin implementing a basic usage example. Please, feel free to comment on any part of
this and suggest anything implementation-wise or design-wise.

At the very end there is an anonymous poll in case you don't have a strong opinion or don't want to write much, but
still want to express one. Thank you for your time!

## Context and Problem Statement

 * What is the problem being solved?

    LLMs can potentially help with lots of things, but in this case I'd like to start with something rather small:
    **ERB template writing**.

 * How does this affect the user or developer?

    Even though we continuously try to help users with understanding of ERB templates and how to write them, we still
    see questions and misunderstanding, which suggests that this is a place we still might improve a bit.

    We always try our best to answer such queries here on the forum or Matrix, or any place we're contacted in, but sometimes
    we might not notice such a question and users might get frustrated without any help for a prolonged time or even worse:
    they might wait for days just to get _that's not possible_ answer.

    Introducing a way to ask the application itself to create a template should help us at least to reduce the first line
    of questions like _how_. On the other hand we might get even more questions like _why this doesn't work_, but with
    a smart model and some restrictions on it we also might improve this potential issue.

 * Background information that helps understand the current state.

    Currently we have some examples of different kinds of templates embedded within the application itself to be used and
    inspired by. We also have embedded documentation available on *https://foreman.example.com/templates_doc*, which lists
    all the available methods that can be used as well as some basic help on template writing. We also embedded these methods
    in the template editor for autocomplete, so documentation is more interactive instead of being just a reference.

## Proposal

 * Include all relevant details of the solution

    First of all, I don't plan to create yet another model and train it: I simply don't have resources to do so, but more
    importantly, why create something instead of re-using existing. That's the main idea: allow the use of existing models
    per user preference. It can be either a locally running model or in the cloud, it's up to the users.

    We would take that model and call it **Connection**, then we use that **Connection** to pass a query (**Prompt**)
    (such as _"Create a report with all incompliant hosts in ofedoren.com domain. In the report include their uptime, IPv4."_).
    I'll use this dummy **Example Prompt** further as reference.

    The output (**Response**) will be a ready to use (in case of **Example Prompt**) report template. As a first iteration
    it could be a read-only box with **copy** function, but we could integrate this output directly into a job to save
    some clicks.

    To summarize the above, here's a picture of what I mean: <TODO>

    This raises a question: why would we want to bloat Foreman when I can go to `<my_favorite_chatbot>` instead?
    My answer would be: because they lack context. You'll probably end up doing the same what this RFC is about.

    Without any context whatsoever [1] is what I got from ChatGPT using **Example Prompt**.

    Same question, but for DeepSeek gave me [2].

    This is pretty nice, but won't work. It doesn't take `Safe Mode` in consideration, doesn't use allowed only methods.

    The response indeed highly depends on the model and the prompt, thus tweaking it or choosing a different model can
    improve the response.

    One of the ways to improve is filling the model with better data and restrict the response to be based only on
    provided data. A quite easy and naive way to do so is to pass the whole DSL documentation as part of the prompt.
    [3] is what I got by doing so from DeepSeek.

    This looks much more promising. It still needs a little bit of adjusting, but the template is quite Foreman compatible.
    I'd personally call it a Proof Of Concept state of the plugin to be able to play with.

    To improve the result even more, we could do the following:
      - Revisit current DSL documentation and find places for improvement.
      - Introduce RAG (Retrieval-Augmented Generation) system [4] that dynamically injects only relevant DSL functions
        into the LLM prompt instead of naively putting the documentation as part of the prompt.

 * Include any technical and project level impacts

    - The solution is heavily dependent on `ruby-openai` [5] library doing the actual heavy lifting.
    - The whole plugin is useless without any kind of available OpenAI API compatible model running either locally or remotely.
    - The plugin will come with predefined use case (template generation), but due to the nature of LLMs, the connection
      can be re-used for other purposes, thus making the plugin either a dependency of potential others or quite intrusive,
      making it harder to properly design at the PoC stage.

### Alternative Designs

 * Include any alternative solutions, and why they are not preferred

    The initial idea is to make template writing easier. The proposed solution suggests a certain workflow:
    `open a new page -> describe desired template -> copy the output -> open template editor -> paste the output to save and use the new template`.

    _Note: this gets trickier when inputs come to play. One of the ways of dealing with this is to ask the model to take_
    _the inputs into consideration and define them as metadata in the template, so the result can be downloaded and then_
    _imported into Foreman to automatically create inputs from metadata._


    An alternative of this could be improving autocompletion in the editor itself, essentially getting rid of the
    current one in favor of the AI based.

## Decision Outcome

TBD

## Impacts

TBD

## References

[1]
[details="DummyPrompt"]

`You're a system administrator using Foreman application. Create a report template in ERB which meets the following: a report with all incompliant hosts in ofedoren.com domain. In the report include their uptime, IPv4.`

[/details]

[details="Response"]
```
      <%
  # Filter hosts: non-compliant and in the ofedoren.com domain
  hosts = Host.where("domain.name = ?", "ofedoren.com")
              .joins(:domain)
              .includes(:interfaces, :status)
              .select { |host| host.report_status.incorrect > 0 }
%>

<%- if hosts.any? -%>
Host Report - Incompliant Hosts in ofedoren.com
===============================================

<%- hosts.each do |host| -%>
Hostname: <%= host.name %>
Uptime: <%= host.facts['uptime'] || 'N/A' %>
IPv4: <%= host.primary_interface.try(:ip) || 'N/A' %>
Compliance Issues: <%= host.report_status.incorrect %>

-----------------------------------------------

<%- end -%>
<%- else -%>
No incompliant hosts found in ofedoren.com domain.
<%- end -%>
```
[/details]
[2]
[details="Response"]
```
   <%
# Report: Non-Compliant Hosts in ofedoren.com Domain
# Purpose: List all non-compliant hosts in ofedoren.com domain with their uptime and IPv4 addresses
# Template Type: ERB (Embedded Ruby)
%>

<%= "# Non-Compliant Hosts Report - #{Time.now.strftime('%Y-%m-%d %H:%M')}" %>
<%= "Domain: ofedoren.com" %>
<%= "Generated by: #{@user}" if @user %>

<%
# Query for non-compliant hosts in the specified domain
hosts = @hosts || Host.where(domain: 'ofedoren.com').where.not(compliant: true)
%>

<% if hosts.any? %>
<%= "## Found #{hosts.count} non-compliant host(s)" %>

| Hostname | Uptime | IPv4 Address | Last Report |
|----------|--------|--------------|-------------|
<% hosts.each do |host| %>
| <%= host.name %> | <%= host.uptime || 'N/A' %> | <%= host.ip || host.interfaces.where(type: 'Interface::Primary').first.try(:ip) || 'N/A' %> | <%= host.last_report ? time_ago_in_words(host.last_report) + ' ago' : 'Never' %> |
<% end %>

<% else %>
<%= "## No non-compliant hosts found in ofedoren.com domain" %>
<% end %>

<%= "\n### Report Notes:" %>
<%= "- Only shows hosts marked as non-compliant in the system" %>
<%= "- Uptime is collected from the host's last report" %>
<%= "- IPv4 address shows the primary interface address" %>
```
[/details]
[3]
[details="AdjustedPromptWithDSL"]
```
  You are generating an ERB template for a Ruby on Rails application.

  Only use the following DSL functions described in the JSON formatted documentation:
  #{ApipieDSL.docs[:docs][:classes].select { |k,v| ApipieDslHelper.in_section?('reports',k) }.to_json}

  - Do not use any Ruby native methods unless absolutely necessary.
  - Use ERB syntax properly (<%= %>). For more information, refer to the provided documentation.
  - If you need a function that is missing, add a comment like '# TODO: missing function'.
  - Answer only with the ERB template, nothing else.

  Now, generate an ERB template for the following task:
  "Create a report with all incompliant hosts in ofedoren.com domain. In the report include their uptime, IPv4."
```
[/details]
[details="Response"]
```
<%- load_hosts(search: 'domain = ofedoren.com', includes: :interfaces).each_record do |host| -%>
<%-   if host_uptime_seconds(host) -%>
<%-     uptime_hours = host_uptime_seconds(host) / 3600 -%>
<%-     ipv4 = host.interfaces.find { |i| i.ip.present? }&.ip -%>
<%=     report_row(name: host.name, uptime_hours: uptime_hours, ipv4: ipv4) -%>
<%-   end -%>
<%- end -%>
<%= report_render -%>
```
[/details]
[4] - https://huggingface.co/blog/ngxson/make-your-own-rag (a blog post showing that a basic RAG is quite achievable)
[5] - https://github.com/alexrudall/ruby-openai

## Poll
