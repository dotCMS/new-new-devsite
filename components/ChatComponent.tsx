return (
  <div className="flex flex-col h-full relative">
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[140px]">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4 text-center px-4">
          <Bot className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-semibold">Welcome to dotAI Assistant</h2>
          <p className="text-muted-foreground max-w-md">
            I can answer your questions about the dotCMS platform. Here are some example questions:
          </p>
          <div className="space-y-2 text-left w-full max-w-md">
            <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70" 
                 onClick={() => handleExampleClick("What are the system requirements for dotCMS?")}>
              &quot;What are the system requirements for dotCMS?&quot;
            </div>
            <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70"
                 onClick={() => handleExampleClick("How do I create a new content type in dotCMS?")}>
              &quot;How do I create a new content type in dotCMS?&quot;
            </div>
            <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70"
                 onClick={() => handleExampleClick("How do I search content using rest api??")}>
              &quot;How do I search content using the rest api?&quot;
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
); 