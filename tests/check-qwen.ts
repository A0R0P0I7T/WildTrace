async function getModelDetails() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const d = await res.json();
  const targets = ['qwen/qwen2.5-vl-72b-instruct', 'qwen/qwen3-vl-8b-instruct'];
  for (const t of targets) {
    const found = d.data.find((m: any) => m.id === t);
    if (found) {
      console.log(`\nModel Details for ${t}:`);
      console.log('Name:', found.name);
      console.log('Description:', found.description?.slice(0, 200));
      console.log('Modality:', found.architecture?.modality);
      console.log('Input modalities:', found.architecture?.input_modalities);
      console.log('Context length:', found.context_length);
      console.log('Pricing:', found.pricing);
    }
  }
}

getModelDetails();
