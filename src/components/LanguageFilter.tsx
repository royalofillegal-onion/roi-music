import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LanguageFilterProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "all", name: "Mix All Languages" },
  { code: "telugu", name: "Telugu" },
  { code: "hindi", name: "Hindi" },
  { code: "tamil", name: "Tamil" },
  { code: "kannada", name: "Kannada" },
];

const LanguageFilter: React.FC<LanguageFilterProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/80 backdrop-blur-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {currentLanguage?.name || "Filter by Language"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-gray-900 border-gray-700 text-white z-50"
      >
        {languages.map((language, index) => (
          <React.Fragment key={language.code}>
            {index === 1 && <DropdownMenuSeparator className="bg-gray-700" />}
            <DropdownMenuItem
              onClick={() => onLanguageChange(language.code)}
              className={`cursor-pointer hover:bg-gray-800 focus:bg-gray-800 ${
                selectedLanguage === language.code 
                  ? "bg-music-accent/20 text-music-accent" 
                  : "text-gray-300"
              }`}
            >
              {language.name}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageFilter;