'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Moon, Sun, Plus, Trash2, GripVertical, Github, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => (
  <div className="flex items-center space-x-2">
    <Switch
      id="dark-mode"
      checked={darkMode}
      onCheckedChange={toggleDarkMode}
      className="data-[state=checked]:bg-primary"
    />
    <Label htmlFor="dark-mode" className="sr-only">
      Toggle dark mode
    </Label>
    {darkMode ? (
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    ) : (
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    )}
  </div>
)

const DraggableSection = ({ id, content, index, moveSections, removeSection, updateSection }) => {
  const ref = useRef(null)
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'section',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const [, drop] = useDrop(() => ({
    accept: 'section',
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) {
        return
      }
      moveSections(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  }))

  const dragDropRef = drop(preview(ref))

  return (
    <Card ref={dragDropRef} className={`mb-4 ${isDragging ? 'opacity-50' : ''} bg-card text-card-foreground`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div ref={drag} className="cursor-move">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            value={content.title}
            onChange={(e) => updateSection(id, { ...content, title: e.target.value })}
            className="font-medium flex-grow"
          />
          <Button variant="ghost" size="icon" onClick={() => removeSection(id)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={content.type}
          onValueChange={(value) => updateSection(id, { ...content, type: value })}
        >
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="Select input type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="input">Short Answer</SelectItem>
            <SelectItem value="textarea">Long Answer</SelectItem>
          </SelectContent>
        </Select>
        {content.type === 'input' ? (
          <Input
            placeholder={content.placeholder}
            value={content.placeholder}
            onChange={(e) => updateSection(id, { ...content, placeholder: e.target.value })}
          />
        ) : (
          <Textarea
            placeholder={content.placeholder}
            value={content.placeholder}
            onChange={(e) => updateSection(id, { ...content, placeholder: e.target.value })}
          />
        )}
      </CardContent>
    </Card>
  )
}

const PRChecklist = ({ checklist, updateChecklist }) => (
  <div className="space-y-2">
    {checklist.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Checkbox
          id={`checklist-${index}`}
          checked={item.checked}
          onCheckedChange={(checked) => updateChecklist(index, { ...item, checked })}
        />
        <Label htmlFor={`checklist-${index}`}>{item.label}</Label>
      </div>
    ))}
  </div>
)

const TemplateLibrary = ({ loadTemplate }) => (
  <div className="space-y-2">
    <Button onClick={() => loadTemplate('basic')} variant="outline" className="w-full justify-start">
      <Check className="mr-2 h-4 w-4" /> Basic PR Template
    </Button>
    <Button onClick={() => loadTemplate('feature')} variant="outline" className="w-full justify-start">
      <Check className="mr-2 h-4 w-4" /> Feature Request Template
    </Button>
    <Button onClick={() => loadTemplate('bugfix')} variant="outline" className="w-full justify-start">
      <Check className="mr-2 h-4 w-4" /> Bug Fix Template
    </Button>
  </div>
)

export function PrTemplateGeneratorJsx() {
  const [darkMode, setDarkMode] = useState(false)
  const [sections, setSections] = useState([
    { id: 1, title: 'Issue Link', type: 'input', placeholder: 'Enter issue link' },
    { id: 2, title: 'Summary', type: 'textarea', placeholder: 'Provide a brief summary' },
    { id: 3, title: 'Testing Steps', type: 'textarea', placeholder: 'List testing steps' },
    { id: 4, title: 'Screenshots', type: 'textarea', placeholder: 'Add screenshot descriptions or links' },
  ])
  const [checklist, setChecklist] = useState([
    { label: 'I have tested this change locally', checked: false },
    { label: 'I have updated the documentation', checked: false },
    { label: 'I have added/updated unit tests', checked: false },
    { label: 'I have considered performance implications', checked: false },
  ])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const moveSections = (dragIndex, hoverIndex) => {
    const newSections = [...sections]
    const [reorderedItem] = newSections.splice(dragIndex, 1)
    newSections.splice(hoverIndex, 0, reorderedItem)
    setSections(newSections)
  }

  const removeSection = (id) => {
    setSections(sections.filter(section => section.id !== id))
  }

  const addSection = () => {
    const newId = Math.max(...sections.map(s => s.id)) + 1
    setSections([...sections, { id: newId, title: 'New Section', type: 'input', placeholder: 'Enter content' }])
  }

  const updateSection = (id, newContent) => {
    setSections(sections.map(section => section.id === id ? { ...section, ...newContent } : section))
  }

  const updateChecklist = (index, newItem) => {
    const newChecklist = [...checklist]
    newChecklist[index] = newItem
    setChecklist(newChecklist)
  }

  const loadTemplate = (type) => {
    switch (type) {
      case 'basic':
        setSections([
          { id: 1, title: 'Summary', type: 'textarea', placeholder: 'Provide a brief summary of the changes' },
          { id: 2, title: 'Description', type: 'textarea', placeholder: 'Describe your changes in detail' },
          { id: 3, title: 'Testing', type: 'textarea', placeholder: 'Describe the tests you ran' },
        ])
        break
      case 'feature':
        setSections([
          { id: 1, title: 'Feature Description', type: 'textarea', placeholder: 'Describe the new feature' },
          { id: 2, title: 'Implementation Details', type: 'textarea', placeholder: 'Explain how the feature is implemented' },
          { id: 3, title: 'Usage Example', type: 'textarea', placeholder: 'Provide an example of how to use the new feature' },
        ])
        break
      case 'bugfix':
        setSections([
          { id: 1, title: 'Bug Description', type: 'textarea', placeholder: 'Describe the bug that was fixed' },
          { id: 2, title: 'Root Cause', type: 'textarea', placeholder: 'Explain the root cause of the bug' },
          { id: 3, title: 'Fix Description', type: 'textarea', placeholder: 'Describe how the bug was fixed' },
          { id: 4, title: 'Verification Steps', type: 'textarea', placeholder: 'List steps to verify the bug is fixed' },
        ])
        break
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background text-foreground">
        <nav className="sticky top-0 z-40 w-full px-20 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className="mr-4 hidden md:flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <Github className="h-6 w-6" />
                <span className="hidden font-bold sm:inline-block">PR Template Generator</span>
              </a>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/">Home</a>
                <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/about">About</a>
                <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/docs">Docs</a>
              </nav>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </div>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-6 max-w-screen-xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Template Sections</h2>
              {sections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  id={section.id}
                  content={section}
                  index={index}
                  moveSections={moveSections}
                  removeSection={removeSection}
                  updateSection={updateSection}
                />
              ))}
              <Button onClick={addSection} className="w-full mb-6">
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
              
              <h2 className="text-2xl font-semibold mb-4">PR Checklist</h2>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <PRChecklist checklist={checklist} updateChecklist={updateChecklist} />
                </CardContent>
              </Card>
              
              <h2 className="text-2xl font-semibold mb-4">Template Library</h2>
              <Card>
                <CardContent className="pt-6">
                  <TemplateLibrary loadTemplate={loadTemplate} />
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Preview</h2>
              <Card className="p-4 bg-card text-card-foreground">
                <pre className="whitespace-pre-wrap text-sm">
                  {sections.map(section => `## ${section.title}\n\n${section.placeholder}\n\n`).join('')}
                  {'\n## PR Checklist\n\n'}
                  {checklist.map(item => `- [${item.checked ? 'x' : ' '}] ${item.label}\n`).join('')}
                </pre>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}