# Custom Logo Integration Code

If you ever need to re-apply the custom circular logo (`OptiConnect_Concept_Logo_Only.png`), here is the exact code you need to copy and paste into the respective files. These changes ensure the logo forms a perfect clipping circle without any ugly background borders, scales correctly on the Navigation Bar, and uses modern typography.

---

### 1. The Core Icon Component (`BrandIcon.tsx`)
**FilePath**: `frontend/src/components/ui/BrandIcon.tsx`

Replace the entire `return` statement of the `BrandIcon` component with this. This code converts the square image into a perfect circle, adds an inverted dark-mode state, and slightly scales up the image to remove edge bleeding.

```tsx
const BrandIcon: React.FC<BrandIconProps> = ({
  className = "w-10 h-10",
  iconClassName = "w-full h-full object-contain"
}) => {
  return (
    <div className={`flex items-center justify-center rounded-full overflow-hidden shadow-sm bg-white border border-gray-100 dark:border-gray-800 ${className}`}>
      <img
        src="/OptiConnect_Concept_Logo_Only.png"
        alt="OptiConnect GIS Logo"
        className={`${iconClassName} scale-110 dark:invert dark:hue-rotate-180 dark:contrast-125 transition-all duration-300`}
      />
    </div>
  );
};
```

---

### 2. The Login Screen Fix (`LoginHeader.tsx`)
**FilePath**: `frontend/src/features/auth/pages/LoginPage/components/LoginHeader.tsx`

Update the `BrandIcon` invocation inside the `LoginHeader` component to this. This removes the legacy white "drop shadow box" so the circular logo stands elegantly on its own.

```tsx
      {/* Logo */}
      <div className="mx-auto flex items-center justify-center mb-6 max-w-md">
        <BrandIcon 
          className="w-24 h-24 sm:w-32 sm:h-32 transition-all duration-500 hover:scale-105"
          iconClassName="w-full h-full"
        />
      </div>
```

---

### 3. The Navigation Bar Styling (`index.tsx`)
**FilePath**: `frontend/src/components/NavigationBar/index.tsx`

Update the `BrandIcon` invocation to fit inside the Navigation bar height constraints, and update the text wrapping the "OptiConnect GIS" title to use a sleek tracking-tight bold font-family.

```tsx
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0 gap-3">
            <BrandIcon
              className="w-10 h-10 sm:w-12 sm:h-12"
              iconClassName="w-full h-full"
            />
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 font-sans">
              OptiConnect GIS
            </div>
          </div>
```
